document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     ВАЛЮТА
  ========================== */

  const buttons = document.querySelectorAll('.currency-btn');
  const prices = document.querySelectorAll('.price');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const currency = btn.dataset.currency;

      prices.forEach(price => {
        if (currency === 'usd') {
          price.textContent = `от $${price.dataset.usd}`;
        } else {
          price.textContent = `от ${price.dataset.rub} ₽`;
        }
      });

    });
  });


  /* =========================
     МОДАЛКА
  ========================== */

  const modal = document.getElementById('pricingModal');
  const modalPlan = document.getElementById('modalPlan');
  const closeBtn = modal?.querySelector('.modal__close');
  const overlay = modal?.querySelector('.modal__overlay');

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function openModal(title) {
    if (modalPlan) modalPlan.textContent = title;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    resetFormState();
  }

document.querySelectorAll('.plan .btn.cta').forEach(button => {
  button.addEventListener('click', (e) => {

    e.stopPropagation();

    const plan = button.closest('.plan');
    const title = plan.querySelector('h3').textContent;

    openModal(title);
  });
});


  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);


  /* =========================
     STEP ФОРМА
  ========================== */

  const form = document.querySelector('.modal__form');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const steps = document.querySelectorAll('.form-step');
  const nextBtns = document.querySelectorAll('.next');
  const prevBtns = document.querySelectorAll('.prev');
  const progress = document.querySelector('.progress-fill');
  const successScreen = document.querySelector('.modal__success');

  let currentStep = 0;
  let successTimer = null;

  function updateProgress() {
    if (!progress) return;
    const percent = ((currentStep + 0) / steps.length) * 150;
    progress.style.width = percent + "%";
  }

  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle("active", i === index);
    });
    
    updateProgress();
  }

  function resetFormState() {
    currentStep = 0;

    steps.forEach(step => step.classList.remove("active"));
    if (steps[0]) steps[0].classList.add("active");

    nextBtns.forEach(btn => btn.disabled = true);

    updateProgress();
  }

  function goToStep(index) {
    currentStep = index;
    showStep(currentStep);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateName(name) {
    return name.trim().length >= 2;
  }

  /* --- Кнопки Далее --- */

  nextBtns.forEach((btn, index) => {

    const input = steps[index]?.querySelector("input");
    if (!input) return;

    input.addEventListener("input", () => {

      let isValid = false;

      if (input.type === "email") {
        isValid = validateEmail(input.value);
      } else {
        isValid = validateName(input.value);
      }

      btn.disabled = !isValid;
    });

    btn.addEventListener("click", () => {
      if (btn.disabled) return;

      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    });

  });

  /* --- Кнопки Назад --- */

  prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });


  /* =========================
     TELEGRAM
  ========================== */


function sendToTelegram(name, email, contact, plan) {

  fetch("https://misty-grass-sgpo.wadiyargulnaz.workers.dev", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name,
      email: email,
      contact: contact,
      plan: plan
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Успешно отправлено:", data);
  })
  .catch(err => {
    console.error("Ошибка отправки:", err);
  });
}


  function showSuccess() {

    if (!successScreen) return;

    if (successTimer) clearTimeout(successTimer);

    successScreen.classList.add("active");

    successTimer = setTimeout(() => {
      successScreen.classList.remove("active");
      resetFormState();
      closeModal();
    }, 4000);
  }


  /* =========================
     SUBMIT
  ========================== */





    form.addEventListener('submit', e => {
     e.preventDefault();

  if (!submitBtn) return;

  // ⛔ Если уже заблокировано
  const blockUntil = localStorage.getItem("formBlockUntil");

  if (blockUntil && Date.now() < Number(blockUntil)) {
    startCountdown(Number(blockUntil));
    return;
  }

  const name = form.querySelector('[name="name"]')?.value.trim() || '';
  const email = form.querySelector('[name="email"]')?.value.trim() || '';
  const contact = form.querySelector('[name="contact"]')?.value.trim() || '';
  const plan = modalPlan?.textContent || '';

  if (!validateName(name)) {
    goToStep(0);
    return;
  }

  if (!validateEmail(email)) {
    goToStep(1);
    return;
  }

  if (contact.length < 3) {
    goToStep(2);
    return;
  }


sendToTelegram(name, email, contact, plan);

  // 🔒 Блок на 60 секунд
  const blockTime = Date.now() + 60000;
  localStorage.setItem("formBlockUntil", blockTime);

  startCountdown(blockTime);

  form.reset();
  showSuccess();
});

function startCountdown(blockTime) {

  submitBtn.disabled = true;

  const interval = setInterval(() => {

    const secondsLeft = Math.ceil((blockTime - Date.now()) / 1000);

    if (secondsLeft <= 0) {
      clearInterval(interval);
      submitBtn.disabled = false;
      submitBtn.textContent = "Отправить";
      localStorage.removeItem("formBlockUntil");
      return;
    }

    submitBtn.textContent = `Подождите ${secondsLeft} сек`;

  }, 1000);

}


const contactBtn = document.getElementById('contactBtn');
const waModal = document.getElementById('waModal');
const waCancel = document.getElementById('waCancel');

if (contactBtn && waModal) {

  contactBtn.addEventListener('click', () => {
    waModal.classList.add('active');
  });

  if (waCancel) {
    waCancel.addEventListener('click', () => {
      waModal.classList.remove('active');
    });
  }

  waModal.addEventListener('click', (e) => {
    if (e.target === waModal) {
      waModal.classList.remove('active');
    }
  });

}

const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

function lockScroll() {
   document.body.style.overflow = 'hidden';
   document.body.style.paddingRight = scrollBarWidth + "px";
}

function unlockScroll() {
   document.body.style.overflow = '';
   document.body.style.paddingRight = '';
}

const projects = [
  {
    img: 'https://files.catbox.moe/d3ie81.png',
    title: 'Coffee Landing',
    text: 'Современный адаптивный лендинг для кофейного бренда с акцентом на визуал, атмосферу и плавные анимации. И нтерактивные карточки и чистая верстка без использования фреймворков. Основной фокус проекта — UI/UX, аккуратная типографика и эффектная подача продукта.',
    link: 'https://твой-сайт1.github.io'
  },
  {
    img: 'https://files.catbox.moe/229rgz.png',
    title: 'Cozy View — Ремонт квартир',
    text: 'Многофункциональный лендинг строительной компании с пошаговой формой заявки, валидацией данных и защитой от спама. Интеграция Cloudflare Worker для безопасной отправки заявок в Telegram. Проект включает адаптивную верстку, модальные окна, анимации и современный визуальный стиль.',
    link: 'https://твой-сайт2.github.io'
  },
  {
    img: 'https://files.catbox.moe/0s5ycm.png',
    title: 'Magenta — Веб-курс',
    text: 'Продающий лендинг онлайн-курса с продуманной структурой, тарифными блоками и интерактивными элементами. Использованы градиенты, плавные переходы и динамические эффекты для создания современного digital-стиля. Основная задача — показать ценность продукта и повысить конверсию.',
    link: 'https://твой-сайт3.github.io'
  }
];



  let currentIndex = 0;
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox_img');
  const lightboxTitle = document.getElementById('lightbox_title');
  const lightboxText = document.getElementById('lightbox_text');
  const lightboxLink = document.getElementById('lightbox_link');


  window.openLightbox = index => {
    currentIndex = index;
    lightboxImg.src = images[currentIndex];
    lightbox.classList.add('active');
    lockScroll();
  };

  window.closeLightbox = () => {
    lightbox.classList.remove('active');
    unlockScroll();
  };

  window.changeSlide = step => {
    currentIndex = (currentIndex + step + images.length) % images.length;
    lightboxImg.src = images[currentIndex];
  };



window.openLightbox = index => {
  currentIndex = index;

  lightboxImg.src = projects[index].img;
  lightboxTitle.textContent = projects[index].title;
  lightboxText.textContent = projects[index].text;
  lightboxLink.href = projects[index].link;

  lightbox.classList.add('active');
  lockScroll();
};


  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
});
