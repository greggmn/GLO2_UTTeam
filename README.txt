### README - Projet GL02 Sujet A - UTTeam

Description : Délivrer un utilitaire en invite de commande pour faciliter la gestion des locaux de la SRU ainsi que l'organisation de ses usagers (enseignants et étudiants) en leur proposant un outil de suivi d'occupation des salles de cours. Donner la possibilité de réaliser un export de l'emploi du temps au format CRU.

Format CRU: 
UE = code 1*creneau
code = “+” 2ALPHA 2DIGIT CRLF; Donne le code de l’UE
creneau = “1” “,” type “,”nbplaces“,” jour “,” horaire “,” groupe_cours “,” salle “//” CRLF; Permet d’avoir les données sur les salles réservées pour ce cours
type = (“C”/”D”/”T’) %x31-39 1DIGIT
nbplaces = “P=” 2*3DIGIT; Capacité de la salle
jour = “H=” (“L”/”MA”/”ME”/”J”/”V”/”S”) WSP; Jour de la semaine où le cours se déroule
horaire = 1*2DIGIT “:” 2DIGIT “-” 1*2DIGIT “:” 2DIGIT;1*2DIGIT = 1 ou 2 chiffres, définit l’horaire du groupe
groupe_cours = “F” 1DIGIT
salle = “S= (1ALPHA 3DIGIT)/(%s”EXT” 1DIGIT); Permet de connaître la salle où se déroule le cours

### Installation

$ npm install
$ npm install inquirer  

### Utilisation :

$ node HomeProjet.js

Le programme prend en compte l'ensemble des fichiers CRU présents dans le dossier ./SujetA_data

Attention!:
Il est possible lors de la saisie au clavier d'éléments que le programme nécessite de rentrer deux fois l'information.

### Version : 

# 0.05

- Utilisation de la librairie Inquirer pour améliorer le menu

# 0.04

- Ajout de l'export au format CRU et ICalendar

# 0.03

- Ajout du système de réservation de salle adapté au statut de l'utilisateur
- Ajout de la visualisation des salles disponibles et du taux d'occupation des salles

# 0.02

- Développement de la page HomeProjet.js qui gère le menu du projet

# 0.01

- Développement du parser adapté au format CRU
- Création des classes UE et Creneau (une Ue possède plusieurs créneaux)


### Liste des contributeurs
Théo KOEHLER (theo.koehler@utt.fr)
Lucas RUBAGOTTI (lucas.rubagotti@utt.fr)
Mathys LEMORT (mathys.lemort@utt.fr)
Gregoire GAUMAIN (gregoire.gaumain@utt.fr)

