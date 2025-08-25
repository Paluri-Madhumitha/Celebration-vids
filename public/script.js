const contactForm = document.getElementById('contact-form-data');
const formDetails = document.getElementById('form-details');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const eventDate = document.getElementById('event-date').value;
    const serviceType = document.getElementById('service-type').value;
    const message = document.getElementById('message').value;

    const data = {
        name,
        email,
        phone,
        eventDate,
        serviceType,
        message
    };

    const sendEmail = firebase.functions().httpsCallable('sendMail');

    sendEmail(data)
        .then(result => {
            console.log(result.data.message);
            formDetails.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 15px;">Your request has been submitted successfully!</div>
                <b>Name:</b> ${name}<br>
                <b>Email:</b> ${email}<br>
                <b>Phone:</b> ${phone}<br>
                <b>Event Date:</b> ${eventDate}<br>
                <b>Service Type:</b> ${serviceType}<br>
                <b>Details:</b> ${message}
            `;
            formDetails.style.display = 'block';
            contactForm.reset();
        })
        .catch(error => {
            console.error(error);
            formDetails.innerHTML = `<div style="color: red;">Failed to send your request. Please try again.</div>`;
            formDetails.style.display = 'block';
        });
});