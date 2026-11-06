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
$jobs = narlag_worker_jobs();
$orders = narlag_read_orders();
$workers = narlag_read_workers();

function admin_h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, "UTF-8");
}

function admin_find_index(array $rows, string $id): ?int
{
    foreach ($rows as $i => $row) {
        if ((string) ($row["id"] ?? "") === $id) {
            return $i;
        }
    }
    return null;
}

function admin_worker(array $workers, int $id): ?array
{
    foreach ($workers as $worker) {
        if ((int) ($worker["id"] ?? 0) === $id) {
            return $worker;
        }
    }
    return null;
}

function admin_back(string $tab, string $status = ""): void
{
    $query = ["tab" => $tab];
    if ($status !== "") {
        $query["status"] = $status;
    }
    header("Location: admin.php?" . http_build_query($query));
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $action = (string) ($_POST["action"] ?? "");
    $tab = (string) ($_POST["tab"] ?? "orders");
    if ($tab !== "workers") {
        $tab = "orders";
    }
    $filter = (string) ($_POST["filter"] ?? "");
    if (!in_array($filter, $statuses, true)) {
        $filter = "";
    }

    if ($action === "status") {
        $id = (string) ($_POST["id"] ?? "");
        $status = (string) ($_POST["status"] ?? "");
        $index = admin_find_index($orders, $id);
        if ($index === null || !in_array($status, $statuses, true)) {
            narlag_flash("err", "Захиалгын төлөв солигдсонгүй.");
        } else {
            $orders[$index]["status"] = $status;
            narlag_write_orders($orders);
            narlag_flash("ok", "Захиалгын төлөв хадгалагдлаа.");
        }
        admin_back("orders", $filter);
    }

    if ($action === "assign") {
        $id = (string) ($_POST["id"] ?? "");
        $workerId = (int) ($_POST["worker_id"] ?? 0);
        $index = admin_find_index($orders, $id);
        if ($index === null) {
            narlag_flash("err", "Захиалга олдсонгүй.");
            admin_back("orders", $filter);
        }
        if ($workerId === 0) {
            unset($orders[$index]["worker_id"]);
            narlag_write_orders($orders);
            narlag_flash("ok", "Ажилчны оноолт хасагдлаа.");
            admin_back("orders", $filter);
        }
        $worker = admin_worker($workers, $workerId);
        $already = (int) ($orders[$index]["worker_id"] ?? 0) === $workerId;
        if (!$worker || (empty($worker["active"]) && !$already)) {
            narlag_flash("err", "Идэвхтэй ажилчин сонгоно уу.");
            admin_back("orders", $filter);
        }
        $orders[$index]["worker_id"] = $workerId;
        narlag_write_orders($orders);
        narlag_flash("ok", "Ажилчин оноолоо.");
        admin_back("orders", $filter);
    }

    if ($action === "worker-save") {
        $id = (int) ($_POST["id"] ?? 0);
        $name = trim(preg_replace("/\s+/u", " ", (string) ($_POST["name"] ?? "")) ?? "");
        $phone = preg_replace("/\D/", "", (string) ($_POST["phone"] ?? "")) ?? "";
        $phone = substr($phone, -8);
        $job = (string) ($_POST["job"] ?? "");
        $note = trim(preg_replace("/\s+/u", " ", (string) ($_POST["note"] ?? "")) ?? "");
        $active = isset($_POST["active"]);
        $nameLen = function_exists("mb_strlen") ? mb_strlen($name) : strlen($name);
        $noteLen = function_exists("mb_strlen") ? mb_strlen($note) : strlen($note);

        if ($nameLen < 2) {
            narlag_flash("err", "Ажилчны нэрийг бүтнээр нь бичнэ үү.");
            admin_back("workers");
        }
        if (strlen($phone) !== 8) {
            narlag_flash("err", "Утасны дугаар 8 оронтой байна.");
            admin_back("workers");
        }
        if (!in_array($job, $jobs, true)) {
            narlag_flash("err", "Ажлын төрлөө сонгоно уу.");
            admin_back("workers");
        }
        if ($noteLen > 160) {
            $note = function_exists("mb_substr") ? mb_substr($note, 0, 160) : substr($note, 0, 160);
        }

        if ($id > 0) {
            $index = null;
            foreach ($workers as $i => $worker) {
                if ((int) ($worker["id"] ?? 0) === $id) {
                    $index = $i;
                    break;
                }
            }
            if ($index === null) {
                narlag_flash("err", "Ажилчин олдсонгүй.");
                admin_back("workers");
            }
            $workers[$index]["name"] = $name;
            $workers[$index]["phone"] = $phone;
            $workers[$index]["job"] = $job;
            $workers[$index]["note"] = $note;
            $workers[$index]["active"] = $active;
            narlag_write_workers($workers);
            narlag_flash("ok", "Ажилчны мэдээлэл хадгалагдлаа.");
            admin_back("workers");
        }

        $nextId = 1;
        foreach ($workers as $worker) {
            $nextId = max($nextId, ((int) ($worker["id"] ?? 0)) + 1);
        }
        $workers[] = [
            "id" => $nextId,
            "name" => $name,
            "phone" => $phone,
            "job" => $job,
            "note" => $note,
            "active" => $active,
        ];
        narlag_write_workers($workers);
        narlag_flash("ok", "Ажилчин нэмэгдлээ.");
        admin_back("workers");
    }

    if ($action === "worker-delete") {
        $id = (int) ($_POST["id"] ?? 0);
        $next = [];
        $removed = false;
        foreach ($workers as $worker) {
            if ((int) ($worker["id"] ?? 0) === $id) {
                $removed = true;
                continue;
            }
            $next[] = $worker;
        }
        if (!$removed) {
            narlag_flash("err", "Ажилчин олдсонгүй.");
            admin_back("workers");
        }
        foreach ($orders as $i => $order) {
            if ((int) ($order["worker_id"] ?? 0) === $id) {
                unset($orders[$i]["worker_id"]);
            }
        }
        narlag_write_workers($next);
        narlag_write_orders($orders);
        narlag_flash("ok", "Ажилчныг хаслаа. Холбоотой захиалгын оноолт мөн хасагдсан.");
        admin_back("workers");
    }

    admin_back($tab, $filter);
}

$tab = (($_GET["tab"] ?? "") === "workers") ? "workers" : "orders";
$filter = (string) ($_GET["status"] ?? "");
if (!in_array($filter, $statuses, true)) {
    $filter = "";
}
$flash = narlag_take_flash();
$orders = array_reverse($orders);
$visible = $orders;
if ($filter !== "") {
    $visible = array_values(array_filter($orders, static function ($order) use ($filter): bool {
        return (string) ($order["status"] ?? "шинэ") === $filter;
    }));
}
$activeWorkers = array_values(array_filter($workers, static function ($worker): bool {
    return !empty($worker["active"]);
}));

$page = "admin";
$title = "Админ — Зуслан зүлэг сервис";
$desc = "Захиалга болон ажилчдын хяналт.";
$narlagUser = $account;
require __DIR__ . "/partials/header.php";
?>
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Админ</p>
    <h1>Хяналт</h1>
    <p>Захиалга бүрийг харж төлөв өөрчилнө, ажилчин онооно. Ажилчин нэмэх, засах, хасах эндээс.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <nav class="admin-tabs" aria-label="Админ хэсэг">
      <a class="<?= $tab === "orders" ? "is-on" : "" ?>" href="admin.php?tab=orders">Захиалга (<?= count($orders) ?>)</a>
      <a class="<?= $tab === "workers" ? "is-on" : "" ?>" href="admin.php?tab=workers">Ажилчид (<?= count($workers) ?>)</a>
    </nav>

    <?php if ($flash): ?>
      <div class="<?= ($flash["type"] ?? "") === "ok" ? "form-ok" : "form-error" ?>"><?= admin_h((string) ($flash["text"] ?? "")) ?></div>
    <?php endif; ?>

    <?php if ($tab === "workers"): ?>
      <div class="admin-layout">
        <form class="form-card" method="post" action="admin.php">
          <h2 class="serif">Ажилчин нэмэх</h2>
          <input type="hidden" name="action" value="worker-save">
          <input type="hidden" name="tab" value="workers">
          <label class="field">Нэр
            <input name="name" maxlength="80" required>
          </label>
          <label class="field">Утас
            <input name="phone" type="tel" inputmode="tel" placeholder="99112244" maxlength="20" required>
          </label>
          <label class="field">Ажил
            <select name="job" required>
              <?php foreach ($jobs as $job): ?>
                <option value="<?= admin_h($job) ?>"><?= admin_h($job) ?></option>
              <?php endforeach; ?>
            </select>
          </label>
          <label class="field">Тэмдэглэл
            <input name="note" maxlength="160" placeholder="Жишээ: Гачуурт руу явна">
          </label>
          <label class="check">
            <input type="checkbox" name="active" value="1" checked>
            <span>Идэвхтэй</span>
          </label>
          <button class="btn btn--sun" type="submit">Нэмэх</button>
        </form>
        <div class="order-list">
          <?php if (!$workers): ?>
            <p class="lede">Ажилчин алга. Зүүн талын маягтаар нэмнэ.</p>
          <?php endif; ?>
          <?php foreach ($workers as $worker): ?>
            <?php
              $wid = (int) ($worker["id"] ?? 0);
              $assigned = 0;
              foreach ($orders as $order) {
                  if ((int) ($order["worker_id"] ?? 0) === $wid) {
                      $assigned++;
                  }
              }
            ?>
            <article class="order-card">
              <form id="worker-<?= $wid ?>" method="post" action="admin.php">
                <input type="hidden" name="action" value="worker-save">
                <input type="hidden" name="tab" value="workers">
                <input type="hidden" name="id" value="<?= $wid ?>">
                <div class="order-card__top">
                  <h2><?= admin_h((string) ($worker["name"] ?? "")) ?></h2>
                  <span class="pill <?= !empty($worker["active"]) ? "pill--ok" : "pill--off" ?>"><?= !empty($worker["active"]) ? "идэвхтэй" : "идэвхгүй" ?></span>
                </div>
                <p class="muted">Оноогдсон захиалга: <?= $assigned ?></p>
                <div class="fields">
                  <label class="field">Нэр
                    <input name="name" maxlength="80" required value="<?= admin_h((string) ($worker["name"] ?? "")) ?>">
                  </label>
                  <label class="field">Утас
                    <input name="phone" type="tel" inputmode="tel" maxlength="20" required value="<?= admin_h((string) ($worker["phone"] ?? "")) ?>">
                  </label>
                  <label class="field">Ажил
                    <select name="job">
                      <?php foreach ($jobs as $job): ?>
                        <option value="<?= admin_h($job) ?>" <?= $job === (string) ($worker["job"] ?? "") ? "selected" : "" ?>><?= admin_h($job) ?></option>
                      <?php endforeach; ?>
                    </select>
                  </label>
                  <label class="field">Тэмдэглэл
                    <input name="note" maxlength="160" value="<?= admin_h((string) ($worker["note"] ?? "")) ?>">
                  </label>
                </div>
                <label class="check">
                  <input type="checkbox" name="active" value="1" <?= !empty($worker["active"]) ? "checked" : "" ?>>
                  <span>Идэвхтэй</span>
                </label>
                <div class="order-actions">
                  <button class="btn btn--leaf" type="submit">Хадгалах</button>
                  <button class="btn btn--clay" type="submit" form="drop-<?= $wid ?>">Хасах</button>
                </div>
              </form>
              <form id="drop-<?= $wid ?>" method="post" action="admin.php" onsubmit="return confirm('Энэ ажилчныг хасах уу?');">
                <input type="hidden" name="action" value="worker-delete">
                <input type="hidden" name="tab" value="workers">
                <input type="hidden" name="id" value="<?= $wid ?>">
              </form>
            </article>
          <?php endforeach; ?>
        </div>
      </div>
    <?php else: ?>
      <div class="filters" role="group" aria-label="Төлөвөөр шүүх">
        <a class="filter-link <?= $filter === "" ? "is-on" : "" ?>" href="admin.php?tab=orders">Бүгд</a>
        <?php foreach ($statuses as $status): ?>
          <a class="filter-link <?= $filter === $status ? "is-on" : "" ?>" href="admin.php?tab=orders&amp;status=<?= rawurlencode($status) ?>"><?= admin_h($status) ?></a>
        <?php endforeach; ?>
      </div>
      <?php if (!$visible): ?>
        <p class="lede">Энэ шүүлтэнд захиалга алга.</p>
      <?php else: ?>
        <div class="order-list">
          <?php foreach ($visible as $order): ?>
            <?php
              $oid = (string) ($order["id"] ?? "");
              $status = (string) ($order["status"] ?? "шинэ");
              $pill = "pill--new";
              if ($status === "баталгаажсан") $pill = "pill--ok";
              if ($status === "дууссан") $pill = "pill--done";
              if ($status === "цуцалсан") $pill = "pill--off";
              $workerId = (int) ($order["worker_id"] ?? 0);
              $worker = $workerId ? admin_worker($workers, $workerId) : null;
              $trees = is_array($order["trees"] ?? null) ? $order["trees"] : [];
              $items = is_array($order["items"] ?? null) ? $order["items"] : [];
            ?>
            <article class="order-card">
              <div class="order-card__top">
                <div>
                  <h2><?= admin_h($oid) ?></h2>
                  <p class="muted"><?= admin_h((string) ($order["created"] ?? "")) ?></p>
                </div>
                <span class="pill <?= $pill ?>"><?= admin_h($status) ?></span>
              </div>
              <div class="order-grid">
                <div>
                  <h3>Захиалагч</h3>
                  <p><?= admin_h((string) ($order["name"] ?? "")) ?><br><?= admin_h((string) ($order["phone"] ?? "")) ?></p>
                  <h3>Газар</h3>
                  <p><?= admin_h((string) ($order["date"] ?? "")) ?> · <?= admin_h((string) ($order["time"] ?? "")) ?><br><?= admin_h((string) ($order["area"] ?? "")) ?>, <?= admin_h((string) ($order["place"] ?? "")) ?></p>
                </div>
                <div>
                  <h3>Ажил</h3>
                  <p>
                    <?php if ((int) ($order["lawn_m2"] ?? 0) > 0): ?>Зүлэг <?= (int) $order["lawn_m2"] ?> м²<br><?php endif; ?>
                    <?php if ((int) ($trees["small"] ?? 0) || (int) ($trees["mid"] ?? 0) || (int) ($trees["large"] ?? 0)): ?>
                      Мод <?= (int) ($trees["small"] ?? 0) ?>/<?= (int) ($trees["mid"] ?? 0) ?>/<?= (int) ($trees["large"] ?? 0) ?><br>
                    <?php endif; ?>
                    <?php if (!empty($order["edge"])): ?>Ирмэг засах<br><?php endif; ?>
                    <?php foreach ($items as $item): ?>
                      <?= (($item["mode"] ?? "") === "rent") ? "Түрээс" : "Авах" ?> · <?= admin_h((string) ($item["name"] ?? "")) ?> × <?= (int) ($item["qty"] ?? 0) ?><br>
                    <?php endforeach; ?>
                    <?php if (empty($order["lawn_m2"]) && empty($order["edge"]) && !$items && !((int) ($trees["small"] ?? 0) || (int) ($trees["mid"] ?? 0) || (int) ($trees["large"] ?? 0))): ?>
                      Ажлын мөр алга.
                    <?php endif; ?>
                  </p>
                  <?php if (!empty($order["note"])): ?><p class="muted"><?= admin_h((string) $order["note"]) ?></p><?php endif; ?>
                </div>
                <div>
                  <h3>Дүн</h3>
                  <p>
                    Үйлчилгээ <?= narlag_money((int) ($order["service"] ?? 0)) ?><br>
                    Түрээс <?= narlag_money((int) ($order["rent"] ?? 0)) ?><br>
                    Худалдаа <?= narlag_money((int) ($order["buy"] ?? 0)) ?><br>
                    Хүргэлт <?= narlag_money((int) ($order["delivery_fee"] ?? 0)) ?><br>
                    <strong><?= narlag_money((int) ($order["total"] ?? 0)) ?></strong>
                    <?php if ((int) ($order["deposit"] ?? 0) > 0): ?><br><span class="muted">Барьцаа <?= narlag_money((int) $order["deposit"]) ?></span><?php endif; ?>
                  </p>
                </div>
              </div>
              <div class="order-actions">
                <form method="post" action="admin.php">
                  <input type="hidden" name="action" value="status">
                  <input type="hidden" name="tab" value="orders">
                  <input type="hidden" name="filter" value="<?= admin_h($filter) ?>">
                  <input type="hidden" name="id" value="<?= admin_h($oid) ?>">
                  <label class="field">Төлөв
                    <select name="status">
                      <?php foreach ($statuses as $option): ?>
                        <option value="<?= admin_h($option) ?>" <?= $option === $status ? "selected" : "" ?>><?= admin_h($option) ?></option>
                      <?php endforeach; ?>
                    </select>
                  </label>
                  <button class="btn btn--leaf" type="submit">Төлөв хадгалах</button>
                </form>
                <form method="post" action="admin.php">
                  <input type="hidden" name="action" value="assign">
                  <input type="hidden" name="tab" value="orders">
                  <input type="hidden" name="filter" value="<?= admin_h($filter) ?>">
                  <input type="hidden" name="id" value="<?= admin_h($oid) ?>">
                  <label class="field">Ажилчин
                    <select name="worker_id">
                      <option value="">Оноогоогүй</option>
                      <?php if ($worker && empty($worker["active"])): ?>
                        <option value="<?= (int) $worker["id"] ?>" selected><?= admin_h((string) $worker["name"]) ?> (идэвхгүй)</option>
                      <?php endif; ?>
                      <?php foreach ($activeWorkers as $person): ?>
                        <option value="<?= (int) $person["id"] ?>" <?= (int) $person["id"] === $workerId ? "selected" : "" ?>><?= admin_h((string) $person["name"]) ?> · <?= admin_h((string) $person["job"]) ?></option>
                      <?php endforeach; ?>
                    </select>
                  </label>
                  <button class="btn btn--sun" type="submit">Ажилчин оноох</button>
                </form>
              </div>
              <?php if (!$worker && $workerId): ?>
                <p class="muted">Өмнө оноосон ажилчин хасагдсан байна.</p>
              <?php elseif (!$activeWorkers): ?>
                <p class="muted">Ажилчин оноохын тулд эхлээд <a href="admin.php?tab=workers">ажилчин нэмнэ</a>.</p>
              <?php endif; ?>
            </article>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    <?php endif; ?>
  </div>
</section>
<?php require __DIR__ . "/partials/footer.php"; ?>
