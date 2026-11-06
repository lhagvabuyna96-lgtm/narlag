<?php
declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function narlag_users_path(): string
{
    return dirname(__DIR__) . "/data/users.json";
}

function narlag_read_json(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function narlag_write_json(string $path, array $rows): void
{
    $handle = fopen($path, "c+");
    if ($handle === false) {
        throw new RuntimeException("json");
    }
    flock($handle, LOCK_EX);
    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, json_encode(array_values($rows), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
}

function narlag_read_users(): array
{
    return narlag_read_json(narlag_users_path());
}

function narlag_write_users(array $users): void
{
    narlag_write_json(narlag_users_path(), $users);
}

function narlag_orders_path(): string
{
    return dirname(__DIR__) . "/data/orders.json";
}

function narlag_workers_path(): string
{
    return dirname(__DIR__) . "/data/workers.json";
}

function narlag_read_orders(): array
{
    return narlag_read_json(narlag_orders_path());
}

function narlag_write_orders(array $orders): void
{
    narlag_write_json(narlag_orders_path(), $orders);
}

function narlag_read_workers(): array
{
    return narlag_read_json(narlag_workers_path());
}

function narlag_write_workers(array $workers): void
{
    narlag_write_json(narlag_workers_path(), $workers);
}

function narlag_worker_jobs(): array
{
    return ["зүлэг", "мод", "жолооч", "ерөнхий"];
}

function narlag_flash(string $type, string $text): void
{
    $_SESSION["flash"] = ["type" => $type, "text" => $text];
}

function narlag_take_flash(): ?array
{
    $flash = $_SESSION["flash"] ?? null;
    unset($_SESSION["flash"]);
    return is_array($flash) ? $flash : null;
}

function narlag_user(): ?array
{
    $id = $_SESSION["user_id"] ?? null;
    if (!$id) {
        return null;
    }
    foreach (narlag_read_users() as $user) {
        if ((int) ($user["id"] ?? 0) === (int) $id) {
            unset($user["password_hash"]);
            return $user;
        }
    }
    unset($_SESSION["user_id"]);
    return null;
}

function narlag_next(?string $value, string $fallback = "profile.php"): string
{
    $value = trim((string) $value);
    if ($value === "" || str_contains($value, "://") || str_starts_with($value, "//") || str_starts_with($value, "/")) {
        return $fallback;
    }
    if (!preg_match("/^[a-z0-9_.?-]+$/i", $value)) {
        return $fallback;
    }
    return $value;
}

function narlag_money(int $amount): string
{
    return number_format($amount, 0, ".", ",") . "₮";
}
