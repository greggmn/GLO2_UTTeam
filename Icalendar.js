const ics = require('ics'); // Assurez-vous d'avoir installé le paquet 'ics'

function creerFichierIcs(nomSalle, jour, horaire, identifiant) {
    const [heureDebut, heureFin] = horaire.split('-').map(h => h.trim());
    const [heure, minute] = heureDebut.split(':').map(h => parseInt(h, 10));

    // Convertir le jour en une date (vous devrez définir une logique pour cela)
    const date = convertirJourEnDate(jour);

    const event = {
        start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), heure, minute],
        end: [date.getFullYear(), date.getMonth() + 1, date.getDate(), ...heureFin.split(':').map(h => parseInt(h, 10))],
        title: `Réservation de la salle ${nomSalle}`,
        description: `Réservation effectuée par ${identifiant}`,
        location: nomSalle,
        status: 'CONFIRMED',
        busyStatus: 'BUSY'
    };

    ics.createEvent(event, (error, value) => {
        if (error) {
            console.log(error);
            return;
        }

        // Écrivez le fichier .ics ou envoyez-le à l'utilisateur
        // Par exemple, enregistrer le fichier localement ou l'envoyer par email
        fs.writeFileSync(`${identifiant}-${nomSalle}-reservation.ics`, value);
    });
}

function convertirJourEnDate(jour) {
    const jours = { "L": 1, "MA": 2, "ME": 3, "J": 4, "V": 5, "S": 6, "D": 0 };
    const today = new Date();
    const todayDayOfWeek = today.getDay();
    const targetDayOfWeek = jours[jour];

    let date = new Date(today);
    date.setDate(today.getDate() + ((7 + targetDayOfWeek - todayDayOfWeek) % 7));

    return date;
}

