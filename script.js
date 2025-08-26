// Function to dynamically generate service cards and populate the dropdown
function createServices() {
    const services = [
        { name: 'Birthday Celebrations', price: '₹300', description: 'A personalized video montage to celebrate a birthday with cherished photos and videos.' },
        { name: 'First Chapter Films (1-3 yrs)', price: '₹350', description: 'A romantic video tribute for the first few years of marriage.' },
        { name: 'A Decade of Love (4-10 yrs)', price: '₹350', description: 'Celebrate a decade of love with a video that tells your unique story.' },
        { name: 'Journey of a Lifetime (10-24 yrs)', price: '₹450', description: 'A special tribute to a lasting love, capturing memories over two decades.' },
        { name: 'The Silver Milestone', price: '₹700', description: 'A grand video celebrating 25 years of togetherness.' },
        { name: 'Golden Jubilee Legacy', price: '₹900', description: 'A magnificent video tribute to 50 years of a beautiful life together.' },
        { name: 'Pre-Wedding Cinematic Video', price: '₹500', description: 'A cinematic video capturing your pre-wedding moments, a perfect memory before the big day.' },
        { name: 'Monthly Birthday Service', price: '₹250', description: 'Never miss a celebration! Get a custom birthday video every month for a loved one.' },
        { name: 'Gender Reveal & Baby Shower', price: '₹350', description: 'Creative video announcements or invitations for your new arrival\'s big reveal or baby shower.' },
        { name: 'Graduation Tributes', price: '₹400', description: 'A video montage celebrating the academic journey and achievements of a graduate.' },
        { name: 'Pet Celebrations', price: '₹200', description: 'A fun video tribute for your pet\'s birthday or adoption anniversary.' },
        { name: 'Farewell Tributes', price: '₹350', description: 'A heartfelt video compilation of messages and memories for a special send-off.' },
        { name: 'Housewarming Videos', price: '₹550', description: 'A custom video invitation or a recap of your special house warming ceremony.' },
        { name: 'Digital Invitations', price: '₹400', description: 'Custom digital invitation cards designed for your event, perfect for sharing on social media.' },
        { name: 'Legacy Tributes', price: '₹650', description: 'A video tribute celebrating a person\'s life and milestones.' }
    ];

    const servicesGrid = document.querySelector('.services-grid');
    const serviceTypeSelect = document.getElementById('service-type');
    
    // Clear existing options before populating
    serviceTypeSelect.innerHTML = '<option value="" disabled selected>-- Select a Service --</option>';

    services.forEach(service => {
        const card = document.createElement('div');
        card.classList.add('service-card');
        card.innerHTML = `
            <h3>${service.name}</h3>
            <div class="price">${service.price}</div>
            <p>${service.description}</p>
        `;
        servicesGrid.appendChild(card);

        const option = document.createElement('option');
        option.value = service.name;
        option.textContent = service.name;
        serviceTypeSelect.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const formDetails = document.getElementById('form-details');
    const serviceTypeSelect = document.getElementById('service-type');
    const otherReasonInput = document.getElementById('other-reason');
    
    // Prevents right-click to make it harder to save images and videos
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Generate the services and populate the dropdown
    createServices();
    
    // Event listener to show/hide the "Other" input field
    serviceTypeSelect.addEventListener('change', () => {
        if (serviceTypeSelect.value === 'Other') {
            otherReasonInput.style.display = 'block';
        } else {
            otherReasonInput.style.display = 'none';
            otherReasonInput.value = ''; // Clear the input if it's hidden
        }
    });

    // Handle form submission and send data to Firebase function
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const eventDate = document.getElementById('event-date').value;
        const serviceType = document.getElementById('service-type').value;
        const otherReason = serviceType === 'Other' ? otherReasonInput.value : '';
        const message = document.getElementById('message').value;

        const data = {
            name,
            email,
            phone,
            eventDate,
            serviceType,
            otherReason,
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
                    ${otherReason ? `<b>Other Reason:</b> ${otherReason}<br>` : ''}
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
});
