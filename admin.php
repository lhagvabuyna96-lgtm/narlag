<?php
declare(strict_types=1);

require __DIR__ . "/includes/auth.php";

$account = narlag_user();
if (!$account) {
    header("Location: nevtreh.php?next=admin.php");
    exit;
}
if (($account["role"] ?? "") !== "admin") {
    http_response_code(403);
    $page = "admin";
    $title = "Хандах эрхгүй — Зуслан зүлэг сервис";
    $narlagUser = $account;
    require __DIR__ . "/partials/header.php";
    echo '<section class="page-hero"><div class="wrap"><p class="eyebrow">403</p><h1>Энэ хуудас админд зориулагдсан</h1></div></section>';
    require __DIR__ . "/partials/footer.php";
    exit;
}

$statuses = ["шинэ", "баталгаажсан", "дууссан", "цуцалсан"];
$file = __DIR__ . "/data/orders.json";
$orders = [];
if (is_file($file)) {
    $decoded = json_decode((string) file_get_contents($file), true);
    if (is_array($decoded)) {
        $orders = $decoded;
    }
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $id = (string) ($_POST["id"] ?? "");
    $status = (string) ($_POST["status"] ?? "");
    if (in_array($status, $statuses, true)) {
        foreach ($orders as $i => $order) {
            if ((string) ($order["id"] ?? "") === $id) {
                $orders[$i]["status"] = $status;
            }
        }
        $handle = fopen($file, "c+");
        if ($handle !== false && flock($handle, LOCK_EX)) {
            rewind($handle);
            ftruncate($handle, 0);
            fwrite($handle, json_encode($orders, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            fflush($handle);
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }
    header("Location: admin.php");
    exit;
}

$orders = array_reverse($orders);
$page = "admin";
$title = "Админ — Зуслан зүлэг сервис";
$desc = "Бүх захиалга.";
$narlagUser = $account;
require __DIR__ . "/partials/header.php";
?>
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Админ</p>
    <h1>Бүх захиалга</h1>
    <p>Төлөвийг шинэ, баталгаажсан, дууссан, цуцалсан болгож өөрчилнө.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <?php if (!$orders): ?>
      <p class="lede">Захиалга алга.</p>
    <?php else: ?>
      <div class="table-wrap">
        <table class="sheet">
          <thead>
            <tr>
              <th>Дугаар</th>
              <th>Захиалагч</th>
              <th>Газар</th>
              <th>Дүн</th>
              <th>Төлөв</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($orders as $order): ?>
              <?php $status = (string) ($order["status"] ?? "шинэ"); ?>
              <tr>
                <td><?= htmlspecialchars((string) ($order["id"] ?? ""), ENT_QUOTES, "UTF-8") ?></td>
                <td><?= htmlspecialchars((string) ($order["name"] ?? ""), ENT_QUOTES, "UTF-8") ?><br><?= htmlspecialchars((string) ($order["phone"] ?? ""), ENT_QUOTES, "UTF-8") ?></td>
                <td><?= htmlspecialchars((string) ($order["date"] ?? ""), ENT_QUOTES, "UTF-8") ?><br><?= htmlspecialchars((string) ($order["area"] ?? ""), ENT_QUOTES, "UTF-8") ?>, <?= htmlspecialchars((string) ($order["place"] ?? ""), ENT_QUOTES, "UTF-8") ?></td>
                <td><?= narlag_money((int) ($order["total"] ?? 0)) ?></td>
                <td>
                  <form method="post" action="admin.php">
                    <input type="hidden" name="id" value="<?= htmlspecialchars((string) ($order["id"] ?? ""), ENT_QUOTES, "UTF-8") ?>">
                    <label class="field">
                      <select name="status">
                        <?php foreach ($statuses as $option): ?>
                          <option value="<?= htmlspecialchars($option, ENT_QUOTES, "UTF-8") ?>" <?= $option === $status ? "selected" : "" ?>><?= htmlspecialchars($option, ENT_QUOTES, "UTF-8") ?></option>
                        <?php endforeach; ?>
                      </select>
                    </label>
                    <button class="btn btn--leaf" type="submit">Хадгалах</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  </div>
</section>
<?php require __DIR__ . "/partials/footer.php"; ?>
