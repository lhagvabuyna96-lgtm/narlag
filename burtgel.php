<?php
declare(strict_types=1);

require __DIR__ . "/includes/auth.php";

$next = narlag_next($_GET["next"] ?? $_POST["next"] ?? "profile.php");
$error = "";

if (narlag_user()) {
    header("Location: profile.php");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim(preg_replace("/\s+/u", " ", (string) ($_POST["name"] ?? "")) ?? "");
    $phone = preg_replace("/\D/", "", (string) ($_POST["phone"] ?? "")) ?? "";
    $phone = substr($phone, -8);
    $email = strtolower(trim((string) ($_POST["email"] ?? "")));
    $password = (string) ($_POST["password"] ?? "");
    $again = (string) ($_POST["again"] ?? "");

    if ((function_exists("mb_strlen") ? mb_strlen($name) : strlen($name)) < 2) {
        $error = "Нэрээ бүтнээр нь бичнэ үү.";
    } elseif (strlen($phone) !== 8) {
        $error = "Утасны дугаар 8 оронтой байна.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Имэйл хаягаа зөв бичнэ үү.";
    } elseif (strlen($password) < 8) {
        $error = "Нууц үг хамгийн багадаа 8 тэмдэгт байна.";
    } elseif ($password !== $again) {
        $error = "Нууц үг хоёр талбар дээр адилхан биш байна.";
    } else {
        $users = narlag_read_users();
        foreach ($users as $user) {
            if (strtolower((string) ($user["email"] ?? "")) === $email) {
                $error = "Энэ имэйлээр бүртгэл байна. Нэвтэрнэ үү.";
                break;
            }
        }
        if ($error === "") {
            $nextId = 1;
            foreach ($users as $user) {
                $nextId = max($nextId, ((int) ($user["id"] ?? 0)) + 1);
            }
            $users[] = [
                "id" => $nextId,
                "name" => $name,
                "phone" => $phone,
                "email" => $email,
                "password_hash" => password_hash($password, PASSWORD_DEFAULT),
                "role" => "customer",
            ];
            narlag_write_users($users);
            session_regenerate_id(true);
            $_SESSION["user_id"] = $nextId;
            header("Location: " . $next);
            exit;
        }
    }
}

$page = "login";
$title = "Бүртгүүлэх — Зуслан зүлэг сервис";
$desc = "Захиалагчаар бүртгүүлэх.";
require __DIR__ . "/partials/header.php";
?>
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Бүртгэл</p>
    <h1>Хэрэглэгчээр бүртгүүлэх</h1>
    <p>Бүртгэл нь захиалагчийн эрхтэй. Профайл цэснээс нэр, утсаа засна.</p>
  </div>
</section>
<section class="section">
  <div class="wrap" style="max-width:520px">
    <form class="form-card" method="post" action="burtgel.php">
      <?php if ($error !== ""): ?><div class="form-error"><?= htmlspecialchars($error, ENT_QUOTES, "UTF-8") ?></div><?php endif; ?>
      <input type="hidden" name="next" value="<?= htmlspecialchars($next, ENT_QUOTES, "UTF-8") ?>">
      <label class="field">Нэр
        <input name="name" autocomplete="name" maxlength="80" required value="<?= htmlspecialchars((string) ($_POST["name"] ?? ""), ENT_QUOTES, "UTF-8") ?>">
      </label>
      <label class="field">Утас
        <input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="99112244" maxlength="20" required value="<?= htmlspecialchars((string) ($_POST["phone"] ?? ""), ENT_QUOTES, "UTF-8") ?>">
      </label>
      <label class="field">Имэйл
        <input name="email" type="email" autocomplete="email" required value="<?= htmlspecialchars((string) ($_POST["email"] ?? ""), ENT_QUOTES, "UTF-8") ?>">
      </label>
      <label class="field">Нууц үг
        <input name="password" type="password" autocomplete="new-password" minlength="8" required>
      </label>
      <label class="field">Нууц үг дахин
        <input name="again" type="password" autocomplete="new-password" minlength="8" required>
      </label>
      <button class="btn btn--sun" type="submit">Бүртгүүлэх</button>
      <p class="lede" style="margin-top:16px">Бүртгэлтэй юу? <a href="nevtreh.php?next=<?= rawurlencode($next) ?>">Нэвтрэх</a></p>
    </form>
  </div>
</section>
<?php require __DIR__ . "/partials/footer.php"; ?>
