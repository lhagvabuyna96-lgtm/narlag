<?php
declare(strict_types=1);

require __DIR__ . "/includes/auth.php";

$account = narlag_user();
if (!$account) {
    header("Location: nevtreh.php?next=zahialguud.php");
    exit;
}

$orders = [];
$file = __DIR__ . "/data/orders.json";
if (is_file($file)) {
    $all = json_decode((string) file_get_contents($file), true);
    if (is_array($all)) {
        foreach (array_reverse($all) as $order) {
            if ((int) ($order["user_id"] ?? 0) === (int) $account["id"]) {
                $orders[] = $order;
            }
        }
    }
}

$page = "mine";
$title = "Миний захиалга — Нарлаг";
$desc = "Таны Нарлаг захиалгууд.";
$narlagUser = $account;
require __DIR__ . "/partials/header.php";
?>
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Захиалга</p>
    <h1>Миний захиалга</h1>
    <p>Нэвтэрсэн үед илгээсэн захиалга энд харагдана.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <?php if (!$orders): ?>
      <p class="lede">Одоогоор захиалга алга. <a href="zahialga.php">Шинэ захиалга өгөх</a>.</p>
    <?php else: ?>
      <div class="table-wrap">
        <table class="sheet">
          <thead>
            <tr>
              <th>Дугаар</th>
              <th>Өдөр</th>
              <th>Газар</th>
              <th>Дүн</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($orders as $order): ?>
              <tr>
                <td><?= htmlspecialchars((string) ($order["id"] ?? ""), ENT_QUOTES, "UTF-8") ?></td>
                <td><?= htmlspecialchars((string) ($order["date"] ?? ""), ENT_QUOTES, "UTF-8") ?><br><?= htmlspecialchars((string) ($order["time"] ?? ""), ENT_QUOTES, "UTF-8") ?></td>
                <td><?= htmlspecialchars((string) ($order["area"] ?? ""), ENT_QUOTES, "UTF-8") ?><br><?= htmlspecialchars((string) ($order["place"] ?? ""), ENT_QUOTES, "UTF-8") ?></td>
                <td><?= narlag_money((int) ($order["total"] ?? 0)) ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  </div>
</section>
<?php require __DIR__ . "/partials/footer.php"; ?>
