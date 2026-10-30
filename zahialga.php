<?php
$page = "order";
$title = "Захиалга — Нарлаг";
$desc = "Зуслангийн зүлэг, мод, багажны захиалга.";
$scripts = ["assets/js/booking.js"];
require __DIR__ . "/partials/header.php";
?>
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Захиалга</p>
    <h1>Өдөр, газар, ажлаа үлдээнэ үү</h1>
    <p>Тооцоо ойролцоо. Бид залгаж цаг, эцсийн үнийг баталгаажуулна. Тоо мэдэхгүй бол хоосон үлдээж үзлэг захиалж болно.</p>
  </div>
</section>
<section class="order">
  <div class="wrap order__grid">
    <form class="form-card" id="order-form" novalidate>
      <div class="form-error" id="form-error" hidden></div>
      <fieldset>
        <legend>Холбоо</legend>
        <div class="fields">
          <label class="field">Нэр
            <input name="name" autocomplete="name" maxlength="80" required value="<?= htmlspecialchars((string) ($narlagUser["name"] ?? ""), ENT_QUOTES, "UTF-8") ?>">
          </label>
          <label class="field">Утас
            <input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="99112244" maxlength="20" required value="<?= htmlspecialchars((string) ($narlagUser["phone"] ?? ""), ENT_QUOTES, "UTF-8") ?>">
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Зуслан</legend>
        <div class="fields">
          <label class="field">Бүс
            <select name="area" required>
              <option value="">Сонгоно уу</option>
              <option>Шадивлан</option>
              <option>Жаргалант</option>
              <option>Хандгайт</option>
              <option>Хуурай мухар</option>
              <option>Яргайт</option>
              <option>Гачуурт</option>
              <option>Налайх</option>
              <option>Тэрэлж</option>
              <option>Бусад</option>
            </select>
          </label>
          <label class="field">Очих өдөр
            <input name="date" type="date" required>
          </label>
          <label class="field field--full">Хашаа, байршил
            <input name="place" maxlength="160" placeholder="Хороо, гудамж, хашааны тоот" required>
          </label>
          <label class="field field--full">Цаг
            <select name="time">
              <option value="Аль ч цаг">Аль ч цаг</option>
              <option value="Өглөө 08–12">Өглөө 08–12</option>
              <option value="Өдөр 12–16">Өдөр 12–16</option>
              <option value="Орой 16–19">Орой 16–19</option>
            </select>
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Зүлэг, мод</legend>
        <div class="fields">
          <label class="field">Зүлэг, м²
            <input name="lawn" type="number" min="0" max="20000" value="0" inputmode="numeric">
          </label>
          <label class="field">Жижиг мод
            <input name="small" type="number" min="0" max="100" value="0" inputmode="numeric">
          </label>
          <label class="field">Дунд мод
            <input name="mid" type="number" min="0" max="100" value="0" inputmode="numeric">
          </label>
          <label class="field">Том мод
            <input name="large" type="number" min="0" max="100" value="0" inputmode="numeric">
          </label>
        </div>
        <label class="check"><input type="checkbox" name="edge"> Ирмэг засах</label>
      </fieldset>
      <fieldset>
        <legend>Багаж</legend>
        <div class="fields">
          <label class="field">Түрээсийн хоног
            <input name="days" type="number" min="1" max="30" value="1" data-rent-days inputmode="numeric">
          </label>
        </div>
        <label class="check"><input type="checkbox" name="delivery"> Хүргэж өгөх, авч өгөх — 15,000₮</label>
        <p class="lede">Сагсанд нэмсэн багаж баруун талд гарна. <a href="tuurees.php">Түрээс</a> · <a href="hudaldah.php">Худалдаа</a></p>
      </fieldset>
      <fieldset>
        <legend>Нэмэлт</legend>
        <label class="field">Тайлбар
          <textarea name="note" maxlength="1000" placeholder="Хаалга, нохой, налуу, очих зам..."></textarea>
        </label>
      </fieldset>
      <div class="hp" aria-hidden="true">
        <label>Вэб сайт <input name="website" tabindex="-1" autocomplete="off"></label>
      </div>
      <button class="btn btn--sun" type="submit">Захиалга илгээх</button>
    </form>
    <aside class="summary-card" id="summary-card">
      <p class="eyebrow">Дүн</p>
      <h2>Ойролцоо үнэ</h2>
      <div id="summary"></div>
      <p class="grand"><span>Нийт</span><strong id="grand">0₮</strong></p>
      <p class="summary__note">Барьцаа нийт дүнд ороогүй. Багаж авахад төлнө, буцаахад буцаана.</p>
    </aside>
  </div>
  <div class="wrap">
    <div class="success" id="success" hidden>
      <p class="eyebrow">Авлаа</p>
      <h2>Захиалга бүртгэгдлээ</h2>
      <p id="success-text"></p>
      <a class="btn btn--leaf" href="index.php">Нүүр лүү</a>
    </div>
  </div>
</section>
<noscript>
  <div class="wrap" style="padding-bottom:40px">
    <p class="form-error">Захиалга илгээхийн тулд JavaScript асаана уу, эсвэл 9911-2244 дугаарт залгана уу.</p>
  </div>
</noscript>
<?php require __DIR__ . "/partials/footer.php"; ?>
