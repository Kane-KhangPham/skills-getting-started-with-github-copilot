document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants list HTML (inline, not in a separate block)
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <strong>Participants:</strong>
            <ul class="participants-list no-bullets">
              ${details.participants.map(p => `
                <li>
                  <span class="participant-name">${p}</span>
                  <span class="delete-icon" title="Remove participant" data-activity="${name}" data-participant="${p}">&#128465;</span>
                </li>
              `).join("")}
            </ul>
          `;
        } else {
          participantsHTML = `
            <strong>Participants:</strong>
            <span class="no-participants">No participants yet.</span>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p>
            <strong>Schedule:</strong> ${details.schedule}<br>
            <strong>Availability:</strong> ${spotsLeft} spots left<br>
            ${participantsHTML}
          </p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after successful signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
  // Delegate click event for delete icons
  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-icon")) {
      const activity = event.target.getAttribute("data-activity");
      const participant = event.target.getAttribute("data-participant");
      if (activity && participant) {
        if (confirm(`Remove ${participant} from ${activity}?`)) {
          try {
            const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(participant)}`, {
              method: "POST"
            });
            const result = await response.json();
            if (response.ok) {
              messageDiv.textContent = result.message || "Participant removed.";
              messageDiv.className = "success";
              fetchActivities();
            } else {
              messageDiv.textContent = result.detail || "Failed to remove participant.";
              messageDiv.className = "error";
            }
            messageDiv.classList.remove("hidden");
            setTimeout(() => {
              messageDiv.classList.add("hidden");
            }, 5000);
          } catch (error) {
            messageDiv.textContent = "Error removing participant.";
            messageDiv.className = "error";
            messageDiv.classList.remove("hidden");
          }
        }
      }
    }
  });
});
