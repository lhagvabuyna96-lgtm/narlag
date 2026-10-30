<?php
declare(strict_types=1);

require __DIR__ . "/includes/auth.php";

$account = narlag_user();
if (!$account) {
    header("Location: nevtreh.php?next=profile.php");
    exit;
}

$notice = "";
$error = "";
$passwordError = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $users = narlag_read_users();
    $index = null;
    foreach ($users as $i => $user) {
        if ((int) ($user["id"] ?? 0) === (int) $account["id"]) {
            $index = $i;
            break;
        }
    }
    if ($index === null) {
        header("Location: garah.php");
        exit;
    }

    if (($_POST["form"] ?? "") === "password") {
        $current = (string) ($_POST["current"] ?? "");
        $password = (string) ($_POST["password"] ?? "");
        $again = (string) ($_POST["again"] ?? "");
        if (!password_verify($current, (string) $users[$index]["password_hash"])) {
            $passwordError = "Одоогийн нууц үг буруу байна.";
        } elseif (strlen($password) < 8) {
            $passwordError = "Шинэ нууц үг хамгийн багадаа 8 тэмдэгт байна.";
        } elseif ($password !== $again) {
            $passwordError = "Шинэ нууц үг хоёр талбар дээр адилхан биш байна.";
        } else {
            $users[$index]["password_hash"] = password_hash($password, PASSWORD_DEFAULT);
            narlag_write_users($users);
            header("Location: profile.php?ok=password");
            exit;
        }
    } else {
        $name = trim(preg_replace("/\s+/u", " ", (string) ($_POST["name"] ?? "")) ?? "");
        $phone = preg_replace("/\D/", "", (string) ($_POST["phone"] ?? "")) ?? "";
        $phone = substr($phone, -8);
        if ((function_exists("mb_strlen") ? mb_strlen($name) : strlen($name)) < 2) {
            $error = "Нэрээ бүтнээр нь бичнэ үү.";
        } elseif (strlen($phone) !== 8) {
            $error = "Утасны дугаар 8 оронтой байна.";
        } else {
            $users[$index]["name"] = $name;
            $users[$index]["phone"] = $phone;
            narlag_write_users($users);
            header("Location: profile.php?ok=profile");
            exit;
        }
        $account["name"] = $name;
        $account["phone"] = $phone;
    }
}

if (($_GET["ok"] ?? "") === "profile") {
    $notice = "Нэр, утас шинэчлэгдлээ.";
}
if (($_GET["ok"] ?? "") === "password") {
    $notice = "Нууц үг солигдлоо.";
}

$narlagUser = narlag_user() ?: $account;
$page = "profile";
$title = "Профайл — Нарлаг";
$desc = "Нарлаг бүртгэлийн мэдээлэл.";
require __DIR__ . "/partials/header.php";
?>
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Профайл</p>
    <h1><?= htmlspecialchars((string) $narlagUser["name"], ENT_QUOTES, "UTF-8") ?></h1>
    <p><?= ($narlagUser["role"] ?? "") === "admin" ? "Админ" : "Захиалагч" ?> · <?= htmlspecialchars((string) $narlagUser["email"], ENT_QUOTES, "UTF-8") ?></p>
  </div>
</section>
<section class="section">
  <div class="wrap profile-grid">
    <form class="form-card" method="post" action="profile.php">
      <?php if ($notice !== ""): ?><div class="form-ok"><?= htmlspecialchars($notice, ENT_QUOTES, "UTF-8") ?></div><?php endif; ?>
      <?php if ($error !== ""): ?><div class="form-error"><?= htmlspecialchars($error, ENT_QUOTES, "UTF-8") ?></div><?php endif; ?>
      <input type="hidden" name="form" value="profile">
      <label class="field">Нэр
        <input name="name" autocomplete="name" maxlength="80" required value="<?= htmlspecialchars((string) $account["name"], ENT_QUOTES, "UTF-8") ?>">
      </label>
      <label class="field">Утас
        <input name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" required value="<?= htmlspecialchars((string) $account["phone"], ENT_QUOTES, "UTF-8") ?>">
      </label>
      <label class="field">Имэйл
        <input type="email" value="<?= htmlspecialchars((string) $account["email"], ENT_QUOTES, "UTF-8") ?>" disabled>
      </label>
      <button class="btn btn--sun" type="submit">Хадгалах</button>
    </form>
    <form class="form-card" method="post" action="profile.php">
      <?php if ($passwordError !== ""): ?><div class="form-error"><?= htmlspecialchars($passwordError, ENT_QUOTES, "UTF-8") ?></div><?php endif; ?>
      <input type="hidden" name="form" value="password">
      <label class="field">Одоогийн нууц үг
        <input name="current" type="password" autocomplete="current-password" required>
      </label>
      <label class="field">Шинэ нууц үг
        <input name="password" type="password" autocomplete="new-password" minlength="8" required>
      </label>
      <label class="field">Шинэ нууц үг дахин
        <input name="again" type="password" autocomplete="new-password" minlength="8" required>
      </label>
      <button class="btn btn--leaf" type="submit">Нууц үг солих</button>
    </form>
  </div>
</section>
<?php require __DIR__ . "/partials/footer.php"; ?>
