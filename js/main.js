const navicon = document.querySelector(".navbar__navicon");
const navbar = document.querySelector(".navbar");
const mobileMenu = document.querySelector(".navbar__menu");
const featuresContainer = document.querySelector(".features");
const formField = document.querySelector(".form__field");
const inputField = document.querySelector(".form__input");
const submitBtn = document.querySelector(".button--form");

//check if localStorage exists
if (localStorage.getItem("url")) {
    const savedURL = localStorage.getItem("url");
    
    displayLinks(savedURL, localStorage);
}

navicon.addEventListener("click", toggleMobileNav);

submitBtn.addEventListener("click", e => {
    e.preventDefault();

    if (inputField.value) {
        fetchData(inputField.value);
    } else {
        displayError();
    }
});

const setAriaAttribute = (block, attr, bool) => block.setAttribute(attr, bool);

const disableScrolling = () => document.body.style.position = "fixed";

const enableScrolling = () => document.body.style.position = "";

function toggleMobileNav() {
    const isOpen = navicon.getAttribute("aria-expanded");

    if (isOpen == "true") {
        setAriaAttribute(navicon, "aria-expanded", "false");
        removeClass(navicon, "open");
        addClass(mobileMenu, "close");
        enableScrolling();

        setTimeout(() => {
            removeClass(mobileMenu, "close")
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

    displayLinks(url, shortLinks);
}

function displayLinks(url, data) {
    hideLoading();

    const linksContainer = document.querySelector(".shortened-links");
    const shortLink = data.short_link;
    const shortLink2 = data.short_link2;
    const shortLink3 = data.short_link3;
    const shortLinksMarkUp = `
    <div class="shortened-links">
        <div class="shortened-links__item">
            <p class="shortened-links__user-input">${url}</p>
            <hr class="shortened-links__divider">

            <div class="shortened-links__wrapper">
                <p class="shortened-links__shortened-url">${shortLink}</p>
                <button class="button button--copy">Copy</button>
            </div>
        </div>
        <div class="shortened-links__item">
            <p class="shortened-links__user-input">${url}</p>
            <hr class="shortened-links__divider">

            <div class="shortened-links__wrapper">
                <p class="shortened-links__shortened-url">${shortLink2}</p>
                <button class="button button--copy">Copy</button>
            </div>
        </div>
        <div class="shortened-links__item">
            <p class="shortened-links__user-input">${url}</p>
            <hr class="shortened-links__divider">

            <div class="shortened-links__wrapper">
                <p class="shortened-links__shortened-url">${shortLink3}</p>
                <button class="button button--copy">Copy</button>
            </div>
        </div>
    </div>    
    `
    //if the container already exists, remove from DOM and generate a new container
    if (linksContainer != null) {
        featuresContainer.removeChild(linksContainer);
    }

    featuresContainer.insertAdjacentHTML("afterbegin", shortLinksMarkUp);

    saveToStorage(url, shortLink, shortLink2, shortLink3);
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

function displayError() {
    addClass(inputField, "error");

    if (formField.childElementCount < 2) {
        formField.insertAdjacentHTML("beforeend", `
        <p class="form__error-text">Please add a link</p>
        `)
    }
}

function showLoading() {
    featuresContainer.insertAdjacentHTML("afterbegin", `
    <div class="loading"></div> 
    `)
}

function hideLoading () {
    const loading = document.querySelector(".loading");

    if (loading) {
        featuresContainer.removeChild(loading);
    }
}

function saveToStorage(url, link1, link2, link3) {
    localStorage.setItem("url", url);
    localStorage.setItem("short_link", link1);
    localStorage.setItem("short_link2", link2);
    localStorage.setItem("short_link3", link3);
}