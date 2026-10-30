<?php
declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function narlag_users_path(): string
{
    return dirname(__DIR__) . "/data/users.json";
}

function narlag_read_users(): array
{
    $path = narlag_users_path();
    if (!is_file($path)) {
        return [];
    }
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function narlag_write_users(array $users): void
{
    $path = narlag_users_path();
    $handle = fopen($path, "c+");
    if ($handle === false) {
        throw new RuntimeException("users");
    }
    flock($handle, LOCK_EX);
    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, json_encode(array_values($users), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
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
