<?php
declare(strict_types=1);

require __DIR__ . "/includes/auth.php";

$next = narlag_next($_GET["next"] ?? $_POST["next"] ?? "profile.php");
$error = "";

if (narlag_user()) {
    header("Location: " . $next);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = strtolower(trim((string) ($_POST["email"] ?? "")));
    $password = (string) ($_POST["password"] ?? "");
    $found = null;
    foreach (narlag_read_users() as $user) {
        if (strtolower((string) ($user["email"] ?? "")) === $email) {
            $found = $user;
            break;
        }
    }
    if (!$found || !password_verify($password, (string) ($found["password_hash"] ?? ""))) {
        $error = "Имэйл эсвэл нууц үг буруу байна.";
    } else {
        session_regenerate_id(true);
        $_SESSION["user_id"] = (int) $found["id"];
        header("Location: " . $next);
        exit;
    }
}

$page = "login";
$title = "Нэвтрэх — Нарлаг";
$desc = "Нарлаг бүртгэлд нэвтрэх.";
require __DIR__ . "/partials/header.php";
?>
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Нэвтрэх</p>
    <h1>Нарлагт нэвтрэх</h1>
    <p>Захиалагч өөрийн захиалгыг харна. Бүртгэлгүй бол шинээр нээнэ.</p>
  </div>
</section>
<section class="section">
  <div class="wrap" style="max-width:520px">
    <form class="form-card" method="post" action="nevtreh.php">
      <?php if ($error !== ""): ?><div class="form-error"><?= htmlspecialchars($error, ENT_QUOTES, "UTF-8") ?></div><?php endif; ?>
      <input type="hidden" name="next" value="<?= htmlspecialchars($next, ENT_QUOTES, "UTF-8") ?>">
      <label class="field">Имэйл
        <input name="email" type="email" autocomplete="email" required value="<?= htmlspecialchars((string) ($_POST["email"] ?? ""), ENT_QUOTES, "UTF-8") ?>">
      </label>
      <label class="field">Нууц үг
        <input name="password" type="password" autocomplete="current-password" minlength="8" required>
      </label>
      <button class="btn btn--sun" type="submit">Нэвтрэх</button>
      <p class="lede" style="margin-top:16px">Шинэ захиалагч уу? <a href="burtgel.php?next=<?= rawurlencode($next) ?>">Бүртгүүлэх</a></p>
    </form>
  </div>
</section>
<?php require __DIR__ . "/partials/footer.php"; ?>
