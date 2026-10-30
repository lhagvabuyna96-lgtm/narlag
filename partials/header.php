<?php
$page = $page ?? "home";
$title = $title ?? "Нарлаг";
$desc = $desc ?? "Зуслангийн зүлэг тэгшлэх, мод засах, багаж хэрэгсэл түрээслэх болон худалдах үйлчилгээ.";

function narlag_active(string $id, string $page): string
{
    return $id === $page ? " is-active" : "";
}
?>
<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($title, ENT_QUOTES, "UTF-8") ?></title>
  <meta name="description" content="<?= htmlspecialchars($desc, ENT_QUOTES, "UTF-8") ?>">
  <meta name="theme-color" content="#143526">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<a class="skip" href="#content">Агуулга руу</a>
<header class="nav">
  <div class="wrap nav__bar">
    <a class="logo" href="index.php">
      <svg class="logo__mark" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#f0b429"/>
        <circle cx="32" cy="32" r="12" fill="#143526"/>
        <g stroke="#143526" stroke-width="3" stroke-linecap="round">
          <path d="M32 8v8M32 48v8M8 32h8M48 32h8"/>
          <path d="M14 14l6 6M44 44l6 6M50 14l-6 6M20 44l-6 6"/>
        </g>
      </svg>
      <span>
        <strong>Нарлаг</strong>
        <small>Зуслангийн үйлчилгээ</small>
      </span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
      <span class="sr-only">Цэс</span>
      <i></i><i></i>
    </button>
    <nav id="site-nav" class="nav__links">
      <a class="<?= narlag_active("home", $page) ?>" href="index.php">Нүүр</a>
      <a class="<?= narlag_active("lawn", $page) ?>" href="zuileg.php">Зүлэг</a>
      <a class="<?= narlag_active("tree", $page) ?>" href="mod.php">Мод</a>
      <a class="<?= narlag_active("rent", $page) ?>" href="tuurees.php">Түрээс</a>
      <a class="<?= narlag_active("sale", $page) ?>" href="hudaldah.php">Худалдаа</a>
      <a class="<?= narlag_active("price", $page) ?>" href="une.php">Үнэ</a>
      <a class="<?= narlag_active("order", $page) ?>" href="zahialga.php">Захиалга</a>
    </nav>
    <div class="nav__actions">
      <a class="nav__phone" href="tel:+97699112244">9911-2244</a>
      <button class="basket-btn" type="button" data-open-basket>
        Сагс <strong data-basket-count hidden>0</strong>
      </button>
    </div>
  </div>
</header>
<main id="content">
