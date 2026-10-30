<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");
date_default_timezone_set("Asia/Ulaanbaatar");

require_once dirname(__DIR__) . "/includes/prices.php";

function fail(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode(["ok" => false, "message" => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function clean_line($value, int $max): string
{
    $text = trim(preg_replace("/\s+/u", " ", strip_tags((string) $value)) ?? "");
    if (function_exists("mb_substr")) {
        return mb_substr($text, 0, $max);
    }
    return substr($text, 0, $max);
}

function clean_note($value, int $max): string
{
    $text = trim(strip_tags((string) $value));
    $text = preg_replace("/\r\n?/", "\n", $text) ?? "";
    if (function_exists("mb_substr")) {
        return mb_substr($text, 0, $max);
    }
    return substr($text, 0, $max);
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    fail(405, "Зөвхөн захиалгын илгээлт хүлээн авна.");
}

$raw = file_get_contents("php://input");
$data = json_decode($raw ?: "", true);
if (!is_array($data)) {
    fail(400, "Захиалгын мэдээлэл дутуу байна.");
}

if (trim((string) ($data["website"] ?? "")) !== "") {
    echo json_encode(["ok" => true, "id" => "NS-0000", "total" => 0, "deposit" => 0], JSON_UNESCAPED_UNICODE);
    exit;
}

$name = clean_line($data["name"] ?? "", 80);
$phoneDigits = preg_replace("/\D/", "", (string) ($data["phone"] ?? "")) ?? "";
if (strlen($phoneDigits) === 11 && substr($phoneDigits, 0, 3) === "976") {
    $phoneDigits = substr($phoneDigits, 3);
}
$areas = ["Шадивлан", "Жаргалант", "Хандгайт", "Хуурай мухар", "Яргайт", "Гачуурт", "Налайх", "Тэрэлж", "Бусад"];
$times = ["Аль ч цаг", "Өглөө 08–12", "Өдөр 12–16", "Орой 16–19"];
$area = clean_line($data["area"] ?? "", 40);
$place = clean_line($data["place"] ?? "", 160);
$date = trim((string) ($data["date"] ?? ""));
$time = clean_line($data["time"] ?? "Аль ч цаг", 40);
$note = clean_note($data["note"] ?? "", 1000);

if (function_exists("mb_strlen") ? mb_strlen($name) < 2 : strlen($name) < 2) {
    fail(422, "Нэрээ бүтнээр нь бичнэ үү.");
}
if (strlen($phoneDigits) !== 8) {
    fail(422, "Утасны дугаар 8 оронтой байна.");
}
if (!in_array($area, $areas, true)) {
    fail(422, "Зуслангийн бүсээ сонгоно уу.");
}
if (function_exists("mb_strlen") ? mb_strlen($place) < 3 : strlen($place) < 3) {
    fail(422, "Хашаа, байршилаа бичнэ үү.");
}
$day = DateTime::createFromFormat("Y-m-d", $date);
$errors = DateTime::getLastErrors();
if (!$day || ($errors && ($errors["warning_count"] > 0 || $errors["error_count"] > 0))) {
    fail(422, "Очих өдрөө зөв сонгоно уу.");
}
$day->setTime(0, 0, 0);
$today = new DateTime("today");
if ($day < $today) {
    fail(422, "Өнөөдрөөс хойшхи өдөр сонгоно уу.");
}
if (!in_array($time, $times, true)) {
    $time = "Аль ч цаг";
}

$lawn = min(price_num($data["lawn"] ?? 0), 20000);
$small = min(price_num($data["small"] ?? 0), 100);
$mid = min(price_num($data["mid"] ?? 0), 100);
$large = min(price_num($data["large"] ?? 0), 100);
$edge = !empty($data["edge"]);
$days = min(max(price_num($data["days"] ?? 1), 1), 30);

$catalogPath = dirname(__DIR__) . "/assets/data/catalog.json";
$catalog = json_decode((string) file_get_contents($catalogPath), true);
if (!is_array($catalog)) {
    fail(500, "Багажны жагсаалт уншигдсангүй.");
}
$byId = [];
foreach ($catalog as $tool) {
    if (isset($tool["id"])) {
        $byId[$tool["id"]] = $tool;
    }
}

$itemsIn = $data["items"] ?? [];
if (!is_array($itemsIn)) {
    fail(422, "Багажны сагс буруу байна.");
}
if (count($itemsIn) > 30) {
    fail(422, "Нэг захиалгад 30-оос олон мөр оруулахгүй.");
}

$storedItems = [];
$rentRaw = 0;
$buyTotal = 0;
$deposit = 0;
$hasTool = false;

foreach ($itemsIn as $item) {
    if (!is_array($item)) {
        fail(422, "Багажны мөр буруу байна.");
    }
    $id = (string) ($item["id"] ?? "");
    $mode = (string) ($item["mode"] ?? "");
    $qty = price_num($item["qty"] ?? 0);
    if (!isset($byId[$id]) || ($mode !== "rent" && $mode !== "buy") || $qty < 1 || $qty > 20) {
        fail(422, "Багажны мэдээлэл хуучирсан байна. Хуудсыг шинэчилнэ үү.");
    }
    $tool = $byId[$id];
    if ($mode === "rent") {
        $rate = (int) ($tool["rent"] ?? 0);
        if ($rate <= 0) {
            fail(422, $tool["name"] . " түрээслэхгүй.");
        }
        $rentRaw += $rate * $qty * $days;
        $deposit += price_deposit((int) ($tool["buy"] ?? 0), $qty);
    } else {
        $buyTotal += (int) ($tool["buy"] ?? 0) * $qty;
    }
    $hasTool = true;
    $storedItems[] = [
        "id" => $id,
        "name" => $tool["name"],
        "mode" => $mode,
        "qty" => $qty,
    ];
}

$rentDiscount = ($days >= PRICE_WEEK_FROM) ? (int) round($rentRaw * PRICE_WEEK_OFF) : 0;
$rentTotal = $rentRaw - $rentDiscount;

$service = price_lawn($lawn) + price_trees($small, $mid, $large) + ($edge ? PRICE_EDGE : 0);
$delivery = (!empty($data["delivery"]) && $hasTool) ? PRICE_DELIVERY : 0;
$total = $service + $rentTotal + $buyTotal + $delivery;

$order = [
    "id" => "NS-" . date("ymd-His") . "-" . random_int(10, 99),
    "created" => date("c"),
    "name" => $name,
    "phone" => $phoneDigits,
    "area" => $area,
    "place" => $place,
    "date" => $day->format("Y-m-d"),
    "time" => $time,
    "lawn_m2" => $lawn,
    "trees" => ["small" => $small, "mid" => $mid, "large" => $large],
    "edge" => $edge,
    "rent_days" => $hasTool ? $days : 0,
    "delivery" => $delivery > 0,
    "note" => $note,
    "items" => $storedItems,
    "service" => $service,
    "rent" => $rentTotal,
    "buy" => $buyTotal,
    "delivery_fee" => $delivery,
    "deposit" => $deposit,
    "total" => $total,
];

$file = dirname(__DIR__) . "/data/orders.json";
$dir = dirname($file);
if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
    fail(500, "Захиалгыг хадгалах хавтас алга.");
}

$handle = fopen($file, "c+");
if ($handle === false) {
    fail(500, "Захиалгыг хадгалж чадсангүй. 9911-2244 дугаарт залгана уу.");
}
if (!flock($handle, LOCK_EX)) {
    fclose($handle);
    fail(500, "Захиалгыг хадгалж чадсангүй. Түр хүлээгээд дахин илгээнэ үү.");
}
$existingRaw = stream_get_contents($handle);
$existing = json_decode($existingRaw ?: "[]", true);
if (!is_array($existing)) {
    flock($handle, LOCK_UN);
    fclose($handle);
    fail(500, "Захиалгын файл гэмтсэн байна.");
}
$existing[] = $order;
rewind($handle);
ftruncate($handle, 0);
fwrite($handle, json_encode($existing, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
fflush($handle);
flock($handle, LOCK_UN);
fclose($handle);

echo json_encode([
    "ok" => true,
    "id" => $order["id"],
    "total" => $total,
    "deposit" => $deposit,
    "service" => $service,
], JSON_UNESCAPED_UNICODE);
