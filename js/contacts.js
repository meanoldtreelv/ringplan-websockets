async function getContacts() {
  let vals = JSON.parse(activeExtension);

  try {
    const contacts = await fetch(
      `${backendApi}/company/directory/contacts?phone=${vals.outbound_callerid?.number || vals.location.callerid}
          `,
      {
        headers: {
          Authorization: id_token,
        },
      }
    );
    if (contacts.ok) {
      const data = await contacts.json();

      localStorage.setItem("contacts", JSON.stringify(data));

      drawContacts(data);
    }
  } catch (error) {
    console.log(error, "error");
  }
}

async function deleteContact(id) {
  try {
    let values = fetch(`${backendApi}/company/directory/contacts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: id_token,
      },
    });
    return values;
  } catch (err) {
    return err;
  }
}

const removeActiveMark = () => {
  document.querySelectorAll(".contact-list-item").forEach((item) => {
    item.classList.remove("bg-gray-100");
  });
};

function openContactDetails(id, data) {
  let contactDetails = document.getElementById("contacts-details");
  let contactAvatar = document.getElementById("contact-avatar");
  let activeElem = document.querySelector(`[data-id="${id}"]`);
  let contactNumber = document.getElementById("contact-number");
  let activeImageSrc = activeElem.querySelector("img").src;
  let contactPhone = document.getElementById("contact-mobile");
  let contactEmail = document.getElementById("contact-email");
  let activeContact = data.find((el) => el.id === id);
  let contactCallBtn = document.getElementById("call-contact-btn");
  let deleteContactTrigger = document.getElementById("delete-contact-btn");
  let deleteContactModal = document.getElementById("delete-confirm-modal");
  let closeContactModal = document.getElementById("close-confirm-modal");
  let cancelAction = document.getElementById("cancel-action");
  let confirmDelete = document.getElementById("confirm-action");

  contactDetails.classList.remove("hidden");
  contactDetails.classList.add("flex");
  contactAvatar.src = activeImageSrc;
  contactNumber.innerHTML = activeContact.phone;

  removeActiveMark();

  activeElem.classList.add("bg-gray-100");

  if (activeContact.email) {
    contactPhone.classList.remove("hidden");
    contactPhone.classList.add("flex");
    contactPhone.querySelector("p").innerText = activeContact.email;
  }

  contactEmail.classList.remove("hidden");
  contactEmail.classList.add("flex");
  contactEmail.querySelector("p").innerText = activeContact.phone;

  contactCallBtn.onclick = () => {
    removeActiveMark();
    contactDetails.classList.remove("flex");
    contactDetails.classList.add("hidden");
    makeCall(activeContact.phone);
  };

  const closeConfirmModal = () => {
    deleteContactModal.classList.remove("grid");
    deleteContactModal.classList.add("hidden");
  };

  deleteContactTrigger.onclick = () => {
    deleteContactModal.classList.remove("hidden");
    deleteContactModal.classList.add("grid");
    deleteContactModal.querySelector("h3").innerText =
      "Are you sure to delete this contact?";
  };

  closeContactModal.onclick = () => {
    closeConfirmModal();
  };

  cancelAction.onclick = () => {
    closeConfirmModal();
  };

  confirmDelete.onclick = () => {
    confirmDelete.disabled = true;
    confirmDelete.innerText = "Loading...";

    confirmDelete.insertAdjacentHTML(
      `afterbegin`,
      `
      <svg 
      id="delete-contact-loading"
      class="inline w-4 h-4 mr-2 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      `
    );
    deleteContact(id)
      .then((res) => {
        confirmDelete.innerText = "Delete";
        confirmDelete.disabled = false;
        closeConfirmModal();
        if (res.ok) {
          showSuccessToast(null, true);
          const newData = [...data].filter((item) => item._id !== id);
          drawContacts(newData);
          contactDetails.classList.remove("flex");
          contactDetails.classList.add("hidden");
        } else {
          showErrorToast();
        }
      })
      .catch((err) => {
        confirmDelete.innerText = "Delete";
        confirmDelete.disabled = false;
        closeConfirmModal();
        console.log(err, "err");
        showErrorToast(err);
      });
  };
}

function drawContacts(data) {
  let contactsLoader = document.getElementById("contacts-list-loader");
  let contactsList = document.getElementById("contacts-list");
  let searchBar = document.getElementById("search-bar");
  let emptyContacts = document.getElementById("empty-contacts");
  contactsLoader.classList.add("hidden");
  contactsLoader.classList.remove("grid");

  if (data.length === 0) {
    emptyContacts.classList.remove("hidden");
    emptyContacts.innerText = `You don't have any contacts`;
    return;
  }

  let html = data
    .map((el) => {
      let acronym =
        el.first_name?.charAt(0)?.toUpperCase() +
        el.last_name?.charAt(0)?.toUpperCase();
      return `
        <div 
        data-id="${el.id}" 
        class="flex contact-list-item cursor-pointer justify-between select-none 
        px-6 py-2 
        items-center border-b border-[#D3D3D3]">
          <div class="flex gap-4 items-center">
            <div class="w-11 h-11">
              <img class="rounded-full" src="${
                el.first_name && el.last_name
                  ? generateAvatar(acronym)
                  : "/images/profile.svg"
              }"/>
            </div>
            <div class="flex flex-col">
                <p class="text-[#232323]">${
                  el.first_name && el.last_name
                    ? el.first_name + " " + el.last_name
                    : el.phone
                }</p>
                <span class="text-[#A3A3A3] ${
                  el.first_name && el.last_name ? "inline" : "hidden"
                }">${el.phone}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join(" ");
  contactsList.classList.remove("hidden");
  contactsList.classList.add("flex");
  contactsList.innerHTML = html;

  let searchContent = `
  <div class="relative w-full">
  <div class="absolute inset-y-0 right-4 flex items-center pl-3 pointer-events-none">
      <svg aria-hidden="true" class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
  </div>
  <input type="text" id="simple-search" 
  class="bg-white border border-gray-300 text-4 text-gray-900 text-sm rounded-lg
   focus:ring-blue-500 focus:border-blue-500 placeholder-[#9A9A9A]
   block w-full p-4" placeholder="Search contacts..." required>
</div>
  `;
  searchBar.innerHTML = searchContent;
  searchBar.classList.remove("hidden");
  searchBar.style.maxWidth = "420px";

  contactsList.querySelectorAll(".contact-list-item").forEach((item) => {
    item.addEventListener("click", () => {
      openContactDetails(item.dataset.id, data);
    });
  });
}