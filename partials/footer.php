</main>
<footer class="site-foot">
  <div class="wrap foot__grid">
    <div>
      <a class="logo" href="index.php">
        <svg class="logo__mark" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#f0b429"/>
          <circle cx="32" cy="32" r="12" fill="#143526"/>
        </svg>
        <span>
          <strong>Нарлаг</strong>
          <small>Зуслангийн үйлчилгээ</small>
        </span>
      </a>
      <p>Зуслангийн зүлэг тэгшлэх, мод засах, тэдгээрт хэрэглэх багажийг түрээслэх болон худалдах.</p>
    </div>
    <div>
      <h2>Холбоо</h2>
      <p><a href="tel:+97699112244">9911-2244</a></p>
      <p>Улаанбаатар, Хан-Уул, зуслангийн бүс</p>
      <p>Өдөр бүр 08:00–19:00</p>
    </div>
    <div>
      <h2>Хуудас</h2>
      <p><a href="zuileg.php">Зүлэг тэгшлэх</a></p>
      <p><a href="mod.php">Мод засах</a></p>
      <p><a href="tuurees.php">Багаж түрээслэх</a></p>
      <p><a href="hudaldah.php">Багаж худалдаалах</a></p>
      <p><a href="une.php">Үнэ</a></p>
      <p><a href="zahialga.php">Захиалга өгөх</a></p>
    </div>
  </div>
</footer>
<div class="legal">© <span data-year>2026</span> Нарлаг. Зуслангийн зүлэг, мод, багаж.</div>

<div class="drawer" id="basket" hidden>
  <div class="drawer__backdrop" data-close-basket></div>
  <aside class="drawer__panel" role="dialog" aria-labelledby="basket-title" aria-modal="true">
    <div class="drawer__head">
      <h2 id="basket-title">Сагс</h2>
      <button class="drawer__close" type="button" data-close-basket aria-label="Хаах">×</button>
    </div>
    <div class="drawer__body" data-basket-body></div>
    <div class="drawer__foot" data-basket-foot></div>
  </aside>
</div>
<div class="toast" data-toast role="status"></div>
<?php
$catalogPath = dirname(__DIR__) . "/assets/data/catalog.json";
$catalog = json_decode((string) file_get_contents($catalogPath), true);
if (!is_array($catalog)) {
    $catalog = [];
}
?>
<script id="catalog-data" type="application/json"><?= json_encode($catalog, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?></script>
<script src="assets/js/pricing.js"></script>
<script src="assets/js/basket.js"></script>
<script src="assets/js/main.js"></script>
<?php foreach ($scripts ?? [] as $src): ?>
<script src="<?= htmlspecialchars($src, ENT_QUOTES, "UTF-8") ?>"></script>
<?php endforeach; ?>
</body>
</html>
