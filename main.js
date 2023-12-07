import { notation } from "./notation.js";

function cloneTemplate(id) {
  return document.getElementById(id).content.cloneNode(true);
}

const subjectBtn = document.querySelectorAll(".subject");
const contain = document.querySelectorAll(".contain");
const loader = document.querySelector(".loading");
const boxQuestion = document.querySelector(".box-question");
const answerBox = document.querySelector(".answer-box");
const submit = document.querySelector(".btn-submit");
const currentQuestion = document.querySelector(".current-question");
const progressBar = document.querySelector(".bar");
const result = document.querySelector(".result");
const title = document.querySelector(".subject-title");
let score = 0;
let number = 1;
let img = 1;
let filter;
let text;

document.addEventListener('DOMContentLoaded', function () {
  answerBox.focus();
});

async function getData() {
  try {
    const response = await fetch("./data.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors du chargement du fichier JSON :", error);
    throw error;
  }
}

getData()
  .then((data) => {
    subjectBtn.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget;
        filter = target.dataset.filter;
        text = e.currentTarget.querySelector("p").innerText

        loader.classList.add("active");
        displayQuestion(number);
        setTimeout(() => {
          contain.forEach((c) => {
            c.classList.toggle("active");
          });
          loader.classList.remove("active");
        }, 1000);
      });
    });

    function displayQuestion(num) {
      //Recuperation de la question et de ses reponses
      if (num > 10) {
        result.style.display = "block";
        contain.forEach((c) => {
          c.classList.remove("active");
        });
        result.querySelector("img").setAttribute("src", `./img/${filter}.jpg`);
        if (score >= 0 && score <= 3) {
          result.querySelector(".comment").textContent =
            notation[filter].faible;
        }
        if (score > 3 && score <= 6) {
          result.querySelector(".comment").textContent = notation[filter].moyen;
        }
        if (score > 6 && score <= 9) {
          result.querySelector(".comment").textContent = notation[filter].bon;
        }
        if (score === 10) {
          result.querySelector(".comment").textContent =
            notation[filter].parfait;
        }

        result.querySelector(".score").textContent = score;
        return;
      } else {
        boxQuestion.textContent = data[filter].questions[num - 1].contenu;
        let id = data[filter].questions[num - 1].id;
        currentQuestion.textContent = id;
        progressBar.style.width = `${(id * 100) / 10}%`;
        title.textContent = text

        answerBox.innerHTML = "";
        data[filter].questions[number - 1].reponses.forEach((res) => {
          let answer = cloneTemplate("answer-template");

          answer.querySelector(".answer").setAttribute("id", `tab-${img}`);
          answer
            .querySelector("img")
            .setAttribute("src", `./img/${img}-solid.svg`);
          answer.querySelector("img").setAttribute("id", res.id);
          answer.querySelector("p").textContent = res.contenu;
          answer.querySelector("p").setAttribute("id", res.id);
          if (res.correcte === true) {
            answer.querySelector(".answer").classList.add("correcte");
          } else {
            answer.querySelector(".answer").classList.add("incorrecte");
          }

          answerBox.append(answer);
          img++;
        });
      }
    }

    answerBox.addEventListener('focus', (event) => {
      if (!answerBox.contains(event.relatedTarget)) {
        // L'élément qui a gagné le focus n'était pas à l'intérieur du conteneur.
        // Déplace le focus vers le premier élément du conteneur.
        answerBox.querySelector('.answer').focus();
      }
    });

    answerBox.addEventListener('blur', (event) => {
      if (!answerBox.contains(event.relatedTarget)) {
        // L'élément qui a perdu le focus n'était pas à l'intérieur du conteneur.
        // Déplace le focus vers le conteneur lui-même.
        answerBox.focus();
      }
    });
    let active;
    //Stocke l'id de la reponse choisi
    answerBox.addEventListener("click", (e) => {
      answerBox.querySelectorAll(".answer").forEach((a) => {
        a.setAttribute("aria-selected", "false");
        a.setAttribute("tabIndex", "-1");
        a.classList.remove("active");
      });
      //À cause du bubbling, obligation de tester la div parent et ses enfants
      if (e.target.matches(".answer")) {
        e.target.setAttribute("aria-selected", "true");
        e.target.setAttribute("tabIndex", "0");
        e.target.classList.add("active");
        active = e.target.querySelector("p").getAttribute("id");
      } else {
        let parent = e.target.parentNode;
        parent.setAttribute("aria-selected", "true");
        parent.setAttribute("tabIndex", "0");
        parent.classList.add("active");
        active = e.target.getAttribute("id");
      }
    });

    let next = 0;
    //Verifie la reponse
    submit.addEventListener("click", () => {
      submit.style.display = "none";
      if (active) {
        if (data[filter].bonnesReponses.includes(parseInt(active))) {
          score++;
          next = 1;
          answerBox.querySelectorAll(".answer").forEach((a) => {
            if (a.querySelector("p").getAttribute("id") == active) {
              a.style.boxShadow = "inset 0px 0px 0px 5px #29bf12";
            }
          });

          setTimeout(() => {
            loader.classList.add("active");
            if (next === 1) {
              img = 1;
              number++;
              displayQuestion(number);
            }
          }, 1000);

          setTimeout(() => {
            submit.style.display = "block";
            loader.classList.remove("active");
          }, 2000);
        } else {
          answerBox.querySelectorAll(".answer").forEach((a) => {
            if (a.querySelector("p").getAttribute("id") == active) {
              a.style.boxShadow = "inset 0px 0px 0px 5px #f21b3f";
            }
          });

          setTimeout(() => {
            answerBox.querySelectorAll(".answer").forEach((a) => {
              if (
                data[filter].bonnesReponses.includes(
                  parseInt(a.querySelector("p").id)
                )
              ) {
                a.style.boxShadow = "inset 0px 0px 0px 5px #29bf12";
              }
            });
          }, 1000);

          next = 1;

          setTimeout(() => {
            loader.classList.add("active");
            if (next === 1) {
              img = 1;
              number++;
              displayQuestion(number);
            }
          }, 2000);

          setTimeout(() => {
            submit.style.display = "block";
            loader.classList.remove("active");
          }, 3000);
        }
        active = null;
      } else {
        alert("Please select");
        submit.style.display = "block";
      }
    });

    result.querySelector(".restart").addEventListener("click", () => {
      score = 0;
      number = 1;

      result.style.display = "none";
      loader.classList.add("active");
      contain[0].classList.add("active");
      contain[1].classList.remove("active");
      answerBox.innerHTML = "";
      setTimeout(() => {
        loader.classList.remove("active");
      }, 2000);
    });

    answerBox.querySelectorAll(".answer").forEach((a) => {
      a.addEventListener("keydown", arrowNavigation);
    });
    
  })
  .catch((error) => {
    console.error("Erreur lors du chargement des commentaires :", error);
  });
