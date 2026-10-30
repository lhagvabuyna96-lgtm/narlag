<?php
$page = "sale";
$title = "Багаж худалдаа — Нарлаг";
$desc = "Зүлэг хадагч, триммер, хөрөө болон цэцэрлэгийн багаж худалдаа.";
require __DIR__ . "/includes/tools.php";
require __DIR__ . "/partials/header.php";
?>
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Худалдаа</p>
    <h1>Багажаа өөрийнх болго</h1>
    <p>Зүлэг тэгшлэх, мод засахад хэрэглэдэг багаж, хамгаалалт, хэрэгсэл.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="filters" role="group" aria-label="Багажны төрөл">
      <button type="button" class="is-on" data-filter="all" aria-pressed="true">Бүгд</button>
      <button type="button" data-filter="zuleg" aria-pressed="false">Зүлэг</button>
      <button type="button" data-filter="mod" aria-pressed="false">Мод</button>
      <button type="button" data-filter="gar" aria-pressed="false">Гар багаж</button>
    </div>
    <div class="tools" id="tool-grid">
      <?php narlag_render_tools(false, "buy"); ?>
    </div>
    <p class="lede" id="tool-empty" hidden>Энэ төрөлд худалдах багаж алга.</p>
    <p style="margin-top:22px"><a class="btn btn--line" href="tuurees.php">Түрээсийн хуудас руу</a></p>
  </div>
</section>
<?php require __DIR__ . "/partials/footer.php"; ?>
