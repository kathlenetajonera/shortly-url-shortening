const navicon = document.querySelector(".navbar__navicon");
const navbar = document.querySelector(".navbar");
const mobileMenu = document.querySelector(".navbar__menu");
const featuresContainer = document.querySelector(".features");
const formField = document.querySelector(".form__field");
const inputField = document.querySelector(".form__input");
const submitBtn = document.querySelector(".button--form");
const linksContainer = document.querySelector(".shortened-links");
const footerLogo = document.querySelector(".footer__logo-link");
const ctaButtons = document.querySelectorAll(".button--cta");
const savedURLs = [];

let windowWidth = window.innerWidth;

//check if localStorage exists
if (localStorage.getItem("savedURLs")) {
    const savedItem = JSON.parse(localStorage.getItem("savedURLs"));

    savedItem.forEach((item) => {
        displayLinks(item.url, item);
    });
}

navicon.addEventListener("click", toggleMobileNav);

inputField.addEventListener("input", () => {
    removeClass(inputField, "error");

    if (inputField.nextElementSibling) {
        inputField.nextElementSibling.remove();
    }
});

submitBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (inputField.value) {
        fetchData(inputField.value);
    } else {
        displayError("empty");
    }
});

footerLogo.addEventListener("click", (e) => {
    e.preventDefault();

    smoothScroll(".navbar");
});

window.addEventListener("resize", () => {
    if (windowWidth != window.innerWidth) {
        windowWidth = window.innerWidth;

        if (windowWidth > 768) {
            setAriaAttribute(navicon, "aria-expanded", "false");
            removeClass(mobileMenu, "open");
            removeClass(navicon, "open");
            enableScrolling();
        }
    }
});

ctaButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        smoothScroll(".form");
    });
});

const setAriaAttribute = (block, attr, bool) => block.setAttribute(attr, bool);

const disableScrolling = () => (document.body.style.position = "fixed");

const enableScrolling = () => (document.body.style.position = "");

const clearInputField = () => (inputField.value = "");
inputField.focus();

function toggleMobileNav() {
    const isOpen = navicon.getAttribute("aria-expanded");

    if (isOpen == "true") {
        setAriaAttribute(navicon, "aria-expanded", "false");
        removeClass(navicon, "open");
        addClass(mobileMenu, "close");
        enableScrolling();

        setTimeout(() => {
            removeClass(mobileMenu, "close");
        }, 1000);
    } else {
        setAriaAttribute(navicon, "aria-expanded", "true");
        addClass(navicon, "open");
        addClass(mobileMenu, "open");
        disableScrolling();
    }
}

async function fetchData(url) {
    showLoading();
    const response = await fetch(`https://api.shrtco.de/v2/shorten?url=${url}`);
    const data = await response.json();
    const shortLinks = await data.result;

    if (data.error_code === 2) {
        hideLoading();
        displayError("invalid");
    } else {
        displayLinks(url, shortLinks);
        clearInputField();
    }
}

function displayLinks(url, data) {
    hideLoading();

    const shortLink = data.short_link;
    const shortLinkMarkUp = `
    <div class="shortened-links__item">
        <p class="shortened-links__user-input">${url}</p>
        <hr class="shortened-links__divider">

        <div class="shortened-links__wrapper">
            <p class="shortened-links__shortened-url">${shortLink}</p>
            <button class="button button--copy" onclick="copyURL(this)">Copy</button>
        </div>
    </div>
    `;

    if (linksContainer.childElementCount < 3) {
        linksContainer.insertAdjacentHTML("afterbegin", shortLinkMarkUp);
    } else {
        linksContainer.lastElementChild.remove();
        linksContainer.insertAdjacentHTML("afterbegin", shortLinkMarkUp);
    }

    saveToStorage(url, shortLink);
}

function addClass(elem, className) {
    const blockName = elem.classList[0];

    switch (className) {
        case "open":
            elem.classList.remove(`${blockName}--close`);
            break;
        case "close":
            elem.classList.remove(`${blockName}--open`);
    }

    elem.classList.add(`${blockName}--${className}`);
}

function removeClass(elem, className) {
    const blockName = elem.classList[0];

    elem.classList.remove(`${blockName}--${className}`);
}

function displayError(errType) {
    addClass(inputField, "error");

    if (formField.childElementCount < 2) {
        if (errType === "empty") {
            formField.insertAdjacentHTML(
                "beforeend",
                `
            <p class="form__error-text">Please add a link</p>
            `
            );
        } else if (errType === "invalid") {
            formField.insertAdjacentHTML(
                "beforeend",
                `
            <p class="form__error-text">Invalid url. Please try again.</p>
            `
            );
        }
    }
}

function showLoading() {
    submitBtn.classList.add("is-loading");
}

function hideLoading() {
    submitBtn.classList.remove("is-loading");
}

function saveToStorage(url, shortLink) {
    let savedURL = {
        url: url,
        short_link: shortLink,
    };

    savedURLs.push(savedURL);
    localStorage.setItem("savedURLs", JSON.stringify(savedURLs));
}

function copyURL(selectedBtn) {
    const shortLink = selectedBtn.previousElementSibling.textContent;
    const inputElem = document.createElement("input");

    inputElem.className = "hidden";
    inputElem.value = shortLink;

    linksContainer.appendChild(inputElem);

    inputElem.select();
    document.execCommand("copy");

    addClass(selectedBtn, "copied");
    selectedBtn.textContent = "Copied!";

    setTimeout(() => {
        removeClass(selectedBtn, "copied");
        selectedBtn.textContent = "Copy";
    }, 1500);
}

function smoothScroll(target) {
    const targetSection = document.querySelector(target);
    const targetPosition =
        targetSection.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let duration = 1000;
    let startTime;

    function animation(currentTime) {
        if (startTime === undefined) startTime = currentTime;

        const timeElapsed = currentTime - startTime;
        let animate = ease(timeElapsed, startPosition, distance, duration);

        window.scrollTo(0, animate);

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}
