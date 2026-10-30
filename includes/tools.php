<?php

require_once __DIR__ . "/icons.php";

function narlag_money(int $n): string
{
    return number_format($n, 0, ".", ",") . "₮";
}

function narlag_tools(): array
{
    static $tools = null;
    if ($tools !== null) {
        return $tools;
    }
    $path = dirname(__DIR__) . "/assets/data/catalog.json";
    $decoded = json_decode((string) file_get_contents($path), true);
    $tools = is_array($decoded) ? $decoded : [];
    return $tools;
}

function narlag_render_tools(bool $featuredOnly = false, ?string $offer = null): void
{
    $cats = [
        "zuleg" => "Зүлэг",
        "mod" => "Мод",
        "gar" => "Гар багаж",
    ];

    foreach (narlag_tools() as $tool) {
        if ($featuredOnly && empty($tool["featured"])) {
            continue;
        }
        $id = htmlspecialchars((string) $tool["id"], ENT_QUOTES, "UTF-8");
        $name = htmlspecialchars((string) $tool["name"], ENT_QUOTES, "UTF-8");
        $desc = htmlspecialchars((string) $tool["desc"], ENT_QUOTES, "UTF-8");
        $cat = (string) ($tool["cat"] ?? "");
        $catLabel = htmlspecialchars($cats[$cat] ?? "", ENT_QUOTES, "UTF-8");
        $catAttr = htmlspecialchars($cat, ENT_QUOTES, "UTF-8");
        $rent = $tool["rent"] ?? null;
        $buy = (int) ($tool["buy"] ?? 0);
        if ($offer === "rent" && !$rent) {
            continue;
        }
        if ($offer === "buy" && $buy <= 0) {
            continue;
        }

        $showRent = $offer !== "buy";
        $showBuy = $offer !== "rent";
        $priceClass = ($showRent && $showBuy) ? "tool__prices" : "tool__prices tool__prices--one";

        echo '<article class="tool" data-cat="' . $catAttr . '">';
        echo '<div class="tool__art" data-cat="' . $catAttr . '">' . narlag_icon((string) ($tool["icon"] ?? "")) . "</div>";
        echo '<p class="tool__cat">' . $catLabel . "</p>";
        echo "<h3>" . $name . "</h3>";
        echo '<p class="tool__desc">' . $desc . "</p>";
        echo '<div class="' . $priceClass . '">';
        if ($showRent) {
            if ($rent) {
                echo "<p><span>Түрээс</span><strong>" . narlag_money((int) $rent) . "</strong><small>/өдөр</small></p>";
            } else {
                echo "<p><span>Түрээс</span><strong>—</strong></p>";
            }
        }
        if ($showBuy) {
            echo "<p><span>Худалдаа</span><strong>" . narlag_money($buy) . "</strong></p>";
        }
        echo '</div><div class="tool__actions">';
        if ($showRent && $rent) {
            echo '<button type="button" class="btn btn--leaf" data-add="rent" data-id="' . $id . '">Түрээслэх</button>';
        }
        if ($showBuy) {
            echo '<button type="button" class="btn btn--clay" data-add="buy" data-id="' . $id . '">Авах</button>';
        }
        echo "</div></article>";
    }
}
