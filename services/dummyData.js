
/**
 * Get nearby healthcare resources based on location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} resourceType - Type of resource to fetch (doctors, medicines, chemists, hospitals, all)
 * @param {string} specialization - Doctor specialization, if applicable
 * @returns {Object} Healthcare resources by category
 */
function getNearbyHealthcareResources(lat, lng, resourceType = 'all', specialization = null) {
    // Dummy data for doctors
    const dummyDoctors = [
        {
            name: "Dr. Anil Sharma",
            specialization: "Cardiologist",
            distance: 1.2,
            address: "123 Health Street, Mumbai",
            rating: 4.8,
            available: true,
            phone: "+91-9876543210"
        },
        {
            name: "Dr. Priya Patel",
            specialization: "Dermatologist",
            distance: 2.5,
            address: "456 Care Lane, Mumbai",
            rating: 4.5,
            available: true,
            phone: "+91-9876543211"
        },
        {
            name: "Dr. Rajan Verma",
            specialization: "Pediatrician",
            distance: 0.8,
            address: "789 Wellness Road, Mumbai",
            rating: 4.9,
            available: false,
            phone: "+91-9876543212"
        },
        {
            name: "Dr. Sunita Gupta",
            specialization: "Neurologist",
            distance: 3.1,
            address: "234 Brain Avenue, Mumbai",
            rating: 4.7,
            available: true,
            phone: "+91-9876543213"
        },
        {
            name: "Dr. Vikram Singh",
            specialization: "Orthopedic",
            distance: 1.5,
            address: "567 Bone Street, Mumbai",
            rating: 4.6,
            available: true,
            phone: "+91-9876543214"
        }
    ];

    // Dummy data for chemists/pharmacies
    const dummyChemists = [
        {
            name: "MedPlus Pharmacy",
            distance: 0.5,
            address: "100 Health Avenue, Mumbai",
            rating: 4.3,
            openNow: true,
            phone: "+91-9876543220"
        },
        {
            name: "Apollo Pharmacy",
            distance: 1.8,
            address: "200 Medicine Lane, Mumbai",
            rating: 4.5,
            openNow: true,
            phone: "+91-9876543221"
        },
        {
            name: "LifeCare Medicines",
            distance: 2.2,
            address: "300 Wellness Road, Mumbai",
            rating: 4.1,
            openNow: false,
            phone: "+91-9876543222"
        }
    ];

    // Dummy data for medicines
    const dummyMedicines = [
        {
            name: "Paracetamol",
            type: "Fever & Pain Relief",
            availableAt: ["MedPlus Pharmacy", "Apollo Pharmacy", "LifeCare Medicines"],
            price: "₹35 - ₹50",
            prescription: false
        },
        {
            name: "Azithromycin",
            type: "Antibiotic",
            availableAt: ["MedPlus Pharmacy", "Apollo Pharmacy"],
            price: "₹120 - ₹150",
            prescription: true
        },
        {
            name: "Montelukast",
            type: "Asthma & Allergy",
            availableAt: ["Apollo Pharmacy"],
            price: "₹180 - ₹220",
            prescription: true
        },
        {
            name: "Cetrizine",
            type: "Antihistamine",
            availableAt: ["MedPlus Pharmacy", "LifeCare Medicines"],
            price: "₹45 - ₹60",
            prescription: false
        },
        {
            name: "Omeprazole",
            type: "Antacid",
            availableAt: ["MedPlus Pharmacy", "Apollo Pharmacy", "LifeCare Medicines"],
            price: "₹85 - ₹110",
            prescription: false
        }
    ];

    // Dummy data for hospitals
    const dummyHospitals = [
        {
            name: "Lilavati Hospital",
            distance: 3.5,
            address: "A-791 Bandra Reclamation, Mumbai",
            rating: 4.7,
            emergency: true,
            phone: "+91-2226751000"
        },
        {
            name: "Kokilaben Hospital",
            distance: 5.2,
            address: "Rao Saheb, Achutrao Patwardhan Marg, Mumbai",
            rating: 4.8,
            emergency: true,
            phone: "+91-2230999999"
        },
        {
            name: "Nanavati Hospital",
            distance: 4.1,
            address: "S.V. Road, Vile Parle West, Mumbai",
            rating: 4.6,
            emergency: true,
            phone: "+91-2226267500"
        }
    ];

    // Filter doctors by specialization if provided
    let filteredDoctors = dummyDoctors;
    if (specialization && specialization.toLowerCase() !== "any") {
        filteredDoctors = dummyDoctors.filter(
            doc => doc.specialization.toLowerCase().includes(specialization.toLowerCase())
        );
    }

    // Return appropriate resources based on request
    const result = {};

    if (resourceType === 'all' || resourceType === 'doctors') {
        result.doctors = filteredDoctors.sort((a, b) => a.distance - b.distance);
    }

    if (resourceType === 'all' || resourceType === 'chemists') {
        result.chemists = dummyChemists.sort((a, b) => a.distance - b.distance);
    }

    if (resourceType === 'all' || resourceType === 'medicines') {
        result.medicines = dummyMedicines;
    }

    if (resourceType === 'all' || resourceType === 'hospitals') {
        result.hospitals = dummyHospitals.sort((a, b) => a.distance - b.distance);
    }

    return result;
}

module.exports = {getNearbyHealthcareResources}