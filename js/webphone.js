let classesStr = `items-center text-[#0D0D54] font-bold bg-[#F7F7FB] border-r-4 border-[#3B9EF7]`;
let activeClasses = classesStr.split(" ");
let subMenuClassesStr = `bg-[#F7F7FB] text-[#0D0D54]`;
let activeSubMenuClasses = subMenuClassesStr.split(" ");

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

async function login() {
  let user = document.getElementById("user_id");
  let pwd = document.getElementById("user_pwd");
  let cname = document.getElementById("user_cname");
  let domain = document.getElementById("user_domain");

  return new Promise((resolve, reject) => {
    $("#my-container").webphone.login(
      user.value,
      pwd.value,
      cname.value,
      domain.value.length > 0 ? domain.value : null,
      async () => {
        sessionStorage.setItem("user", user.value);
        if (params.error) {
          urlSearchParams.delete("error");
          history.pushState({}, "", window.location.pathname);
        }
        user.value = "";
        pwd.value = "";
        resolve();
      },
      async () => {
        reject();
      }
    );
  });
}

const logout = async () => {
  window.location = "/"
  $("#my-container").webphone.logout();
  sessionStorage.clear();

  setCookie("user_id", "", 1);
  setCookie("secret", "", 1);
  setCookie("cname", "", 1);
  setCookie("domain", "", 1);
};

async function updateUI() {
  try {
    await login();
    document.getElementById("login-content").classList.add("hidden");
    const data = await fetch("/dialpad/index.html");
    const html = await data.text();
    document.getElementById("dialpad-content").classList.remove("hidden");
    if (!document.getElementById("main")) {
      document
        .getElementById("dialpad-content")
        .insertAdjacentHTML("afterbegin", html);
    }
    document.getElementById("error-message").style.display = "none";
    document.getElementById("loading-progress").classList.remove("grid");
    document.getElementById("loading-progress").classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    $("#my-container").removeClass("hidden");
    $("#my-container").addClass("flex px-2 md:px-4 lg:px-6 py-6");

    $("#webphone-keypad").removeClass("hidden");
    $("#webphone-keypad").addClass("flex");

    let extensionOpts = document.getElementById("extension-options");
    let phoneTab = document.getElementById("phone-tab");
    let settingsTab = document.getElementById("settings-tab");
    let subMenu = document.getElementById("settings-submenu");
    let pageTitle = document.getElementById("page-title");
    let mainContainer = document.getElementById("main");
    let settingsInfo = document.getElementById("settings-info");
    let mainWrapper = document.getElementById("main-wrapper");
    let logoutPopupTrigger = document.getElementById("logout-trigger");
    let modal = document.getElementById("logout-modal");
    let logoutConfirm = document.getElementById("logout-confirm");
    let logoutCancel = document.getElementById("logout-cancel");
    let container = document.getElementById("my-container");
    mainWrapper.appendChild(container);

    let versionInfoBtn = document.getElementById("version-info");
    let sidebar = document.getElementById("sidebar");
    let hamburgerBtn = document.getElementById("hamburger");

    extensionOpts.querySelector("span").innerText =
      sessionStorage.getItem("user") || getCookie("user_id");

    const cancelLogout = () => {
      modal.classList.remove("grid");
      modal.classList.add("hidden");
      pageTitle.innerText = "Settings - Version Info";
      settingsInfo.classList.remove("!hidden");
      versionInfoBtn.classList.add(...activeSubMenuClasses);
      logoutPopupTrigger.classList.remove(...activeSubMenuClasses);
    };

    // tabs functionality

    settingsTab.onclick = () => {
      settingsTab.children[0].classList.remove("gap-5");
      settingsTab.children[0].classList.add(...activeClasses, "gap-16");
      phoneTab.classList.remove(...activeClasses);
      phoneTab.classList.add("gap-5", "font-medium");
      phoneTab.querySelector("img").classList.add("grayscale");
      settingsTab.querySelector("img").classList.remove("grayscale");
      subMenu.classList.remove("hidden");
      pageTitle.innerText = "Settings - Version Info";
      extensionOpts.classList.add("hidden");
      $("#my-container").addClass("hidden");
      mainContainer.classList.add("!bg-[#F2F2F2]");
      settingsInfo.classList.remove("hidden");
      settingsInfo.classList.add("flex");
      mainWrapper.classList.add("h-main", "grid", "place-items-center");
    };

    phoneTab.onclick = () => {
      phoneTab.classList.remove("gap-5");
      phoneTab.classList.add(...activeClasses, "gap-16");
      settingsTab.children[0].classList.remove(...activeClasses);
      settingsTab.children[0].classList.add("gap-5", "font-medium");
      phoneTab.querySelector("img").classList.remove("grayscale");
      settingsTab.querySelector("img").classList.add("grayscale");
      subMenu.classList.add("hidden");
      pageTitle.innerText = "Phone";
      extensionOpts.classList.remove("hidden");
      $("#my-container").removeClass("hidden");
      mainContainer.classList.remove("!bg-[#F2F2F2]");
      settingsInfo.classList.add("hidden");
      settingsInfo.classList.remove("flex");
      mainWrapper.classList.remove("h-main", "grid", "place-items-center");
    };

    logoutPopupTrigger.onclick = (e) => {
      e.stopPropagation();
      modal.classList.remove("hidden");
      modal.classList.add("grid");
      pageTitle.innerText = "Settings - Logout";
      settingsInfo.classList.add("!hidden");
      versionInfoBtn.classList.remove(...activeSubMenuClasses);
      logoutPopupTrigger.classList.add(...activeSubMenuClasses);
    };

    logoutConfirm.onclick = () => {
      logout();
    };
    logoutCancel.onclick = () => {
      cancelLogout();
    };

    hamburgerBtn.onclick = () => {
      sidebar.classList.toggle("-translate-x-full");
    };
  } catch (error) {
    document.getElementById("dialpad-content").classList.add("hidden");
    document.getElementById("login-content").classList.remove("hidden");
    document.getElementById("loading-progress").classList.remove("grid");
    document.getElementById("loading-progress").classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    document.getElementById("error-message").style.display = "inline";
  }
}

window.onload = function () {
  let userDomain = document.getElementById("user_domain");

  userDomain.value = "zraytechnoloDoobh.ringplan.com";
  let uname = getCookie("user_id") || "",
    pass = getCookie("secret") || "",
    cname = getCookie("cname") || "",
    domain = getCookie("domain") || "";

  let userId = document.getElementById("user_id");
  let password = document.getElementById("user_pwd");
  let cnameInput = document.getElementById("user_cname");

  if (params.user) {
    uname = params.user;
  }
  if (params.pass) {
    pass = params.pass;
  }

  /**
   * 
   * Change domain value from query params
   */
  // if (params.domain) {
  //   userDomain.value = params.domain;
  // }

  if (uname.length > 1 && pass.length > 1 && !params.error) {
    userId.value = uname;
    password.value = pass;
    cnameInput.value = cname;
    updateUI();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  /**
   * 
   * Change outbound server value from query params
   */
  // let serverUrl = getServerUrl();
  // if (params.outbound_server) {
  //   serverUrl = params.outbound_server;
  // }
  $("#my-container").webphone(['sip.ringplan.com']);

  let userId = document.getElementById("user_id");
  let password = document.getElementById("user_pwd");
  let loginBtn = document.getElementById("login-btn");
  let loader = document.getElementById("loading-progress");

  loginBtn.onclick = () => {
    loader.classList.remove("hidden");
    loader.classList.add("grid");
    document.body.classList.add("overflow-hidden");

    updateUI();
  };

  if (params.error) {
    $("#error-message").show();
    userId.value = "";
    password.value = "";
  }
});
