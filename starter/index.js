/********** DOM Elements **********/ 
const toggleSwitch = document.querySelector("#toggle-dark-mode")
const animalForm = document.querySelector("#animal-form")
const animalList = document.querySelector("#animal-list")

/********** Event Listeners **********/
toggleSwitch.addEventListener("click", handleToggleDarkMode)
animalForm.addEventListener("submit", handleAnimalFormSubmit)
animalList.addEventListener("click", handleAnimalListClick)

/********** Event Handlers **********/ 
function handleToggleDarkMode() {
  document.body.classList.toggle("dark-mode")
}


// When animal form submit Event Happens...
// Create Animal
function handleAnimalFormSubmit(event) {
  // Step 0: always prevent default for form submit events
  event.preventDefault()
  
  // Step 1: get user input from the form input fields
  const animalObj = {
    name: event.target.name.value,
    imageUrl: event.target.image_url.value,
    description: event.target.description.value,
    donations: 0
  }
  
  // Do POST /animals Fetch Request...

  fetch("http://localhost:3000/animals", {
    method: 'POST',
    headers: {
      // telling serving we are sending content in json format
      'Content-Type': 'application/json',
    },
    // content being sent in the body of the request
    body: JSON.stringify(animalObj),
  })
    .then(response => response.json())
    .then(newAnimalObj => {
      // And Slap animal card on the DOM
      // Step 2: slap it on the DOM
      renderOneAnimal(newAnimalObj)
      console.log('Success:', newAnimalObj);
    })

  // (optional) Step 3: clear the input fields
  event.target.reset()
}

// event delegation happening below
function handleAnimalListClick(event) {
  if (event.target.matches(".delete-button")) {
    
    // Delete Animal
    const button = event.target
    
    // traverse the DOM to find elements we care about, relative to the button
    const card = button.closest(".card")
    const id = card.dataset.id

    // need the id of the object we want to delete --> use dataset = id
    fetch(`http://localhost:3000/animals/${id}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })

    // remove the animal card
    card.remove()
  } else if (event.target.dataset.action === "donate") {
    
    // Update Animal
    const button = event.target
    
    // traverse the DOM to find elements we care about, relative to the button
    const card = button.closest(".card")
    const id = card.dataset.id
  
    const donationCountSpan = card.querySelector(".donation-count")
    
    // get the donation amount from the DOM
    const donationCount = parseInt(donationCountSpan.textContent)
    
    
    // PATCH /animals/:id
    // body: { donation: 10 }
    fetch(`http://localhost:3000/animals/${id}`, {
      method: 'PATCH',
      headers: {
        // telling serving we are sending content in json format
        'Content-Type': 'application/json',
      },
      // content being sent in the body of the request
      body: JSON.stringify({ 
        donations: donationCount + 10 
      }),
    })
    .then(response => response.json())
    .then(updatedAnimal => {
      console.log('Success:', updatedAnimal);

      // update the DOM
      // pessimistic rendering --> making sure changes happen in db before DOM changed
      donationCountSpan.textContent = updatedAnimal.donations
      })
  }
}

/********** Render Functions **********/ 
// takes one animal object and creates the necessary DOM elements
function renderOneAnimal(animalObj) {
  // step 1. create the outer element using createElement (& assign necessary attributes)
  const card = document.createElement("li")
  card.className = "card"
  card.dataset.id = animalObj.id

  // step 2. use innerHTML to create all of its children
  card.innerHTML = `
  <div class="image">
    <img src="${animalObj.imageUrl}" alt="${animalObj.name}">
    <button class="button delete-button" data-action="delete">X</button>
  </div>
  <div class="content">
    <h4>${animalObj.name}</h4>
    <div class="donations">
      $<span class="donation-count">${animalObj.donations}</span> Donated
    </div>
    <p class="description">${animalObj.description}</p>
  </div>
  <button class="button donate-button" data-action="donate">
    Donate $10
  </button>
  `

  // step 3. slap it on the DOM!
  animalList.append(card)
}

function renderAllAnimals(animalData) {
  // .forEach takes a callback function (function definition/reference); renderOneAnimal is a function reference
  animalData.forEach(renderOneAnimal)
}

/********** Initial Render **********/
function initialize() {
  // animalData is an array of animal objects from data.js
  // renderAllAnimals(animalData)

  // When (the page loads/our JS file runs) Event Happens...
  // Do (GET /animals) Fetch Request...
  fetch("http://localhost:3000/animals")
    .then(response => response.json())
    .then(animalArray => {
      // And Slap (animal cards) on the DOM
      console.log(animalArray)
      renderAllAnimals(animalArray)
    })
}

initialize()

