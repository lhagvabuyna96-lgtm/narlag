<?php
$page = "rent";
$title = "Багаж түрээс — Зуслан зүлэг сервис";
$desc = "Зүлэг хадагч, триммер, хөрөө зэрэг багажийг өдрөөр түрээслэх.";
require __DIR__ . "/includes/tools.php";
require __DIR__ . "/partials/header.php";
?>
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Түрээс</p>
    <h1>Багажаа өдрөөр ав</h1>
    <p>Зүлэг, модны ажилд хэрэглэх багаж. Өглөө 08:00-д авч, орой 19:00-д буцаана.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="rules">
      <article>
        <strong>Өдрийн түрээс</strong>
        <p>08:00-д авч, 19:00-д буцаана.</p>
      </article>
      <article>
        <strong>7 хоног −15%</strong>
        <p>Долоо хоногоос урт түрээс хямдарна.</p>
      </article>
      <article>
        <strong>Барьцаа 30%</strong>
        <p>Худалдах үнээс. Бүтнээр буцаахад буцаана.</p>
      </article>
      <article>
        <strong>Хүргэлт 15,000₮</strong>
        <p>Зуслангийн бүсэд аваачиж, авч өгнө.</p>
      </article>
    </div>
    <div class="filters" role="group" aria-label="Багажны төрөл">
      <button type="button" class="is-on" data-filter="all" aria-pressed="true">Бүгд</button>
      <button type="button" data-filter="zuleg" aria-pressed="false">Зүлэг</button>
      <button type="button" data-filter="mod" aria-pressed="false">Мод</button>
      <button type="button" data-filter="gar" aria-pressed="false">Гар багаж</button>
    </div>
    <div class="tools" id="tool-grid">
      <?php narlag_render_tools(false, "rent"); ?>
    </div>
    <p class="lede" id="tool-empty" hidden>Энэ төрөлд түрээсийн багаж алга.</p>
    <p style="margin-top:22px"><a class="btn btn--line" href="hudaldah.php">Худалдааны хуудас руу</a></p>
  </div>
</section>
<?php require __DIR__ . "/partials/footer.php"; ?>
