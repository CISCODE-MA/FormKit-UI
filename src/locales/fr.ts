/**
 * French translations
 */

import type { TranslationKeys } from '../core/i18n';

const fr: TranslationKeys = {
  // Form actions
  form: {
    submit: 'Envoyer',
    reset: 'Réinitialiser',
    next: 'Suivant',
    back: 'Retour',
    confirm: 'Confirmer',
    submitting: 'Envoi en cours...',
  },

  // Field actions
  field: {
    add: 'Ajouter',
    remove: 'Supprimer',
    showPassword: 'Afficher le mot de passe',
    hidePassword: 'Masquer le mot de passe',
    clearSelection: 'Effacer la sélection',
    search: 'Rechercher...',
    selectOption: 'Sélectionner une option...',
    noOptions: 'Aucune option disponible',
    noOptionsFound: 'Aucune option trouvée',
    loading: 'Chargement...',
    selected: 'sélectionné(s)',
    typeAndEnter: 'Tapez et appuyez sur Entrée',
    phoneNumber: 'Numéro de téléphone',
    yes: 'Oui',
    no: 'Non',
  },

  // Accessibility
  a11y: {
    formSteps: 'Étapes du formulaire',
    required: 'requis',
    stepCurrent: 'actuel',
    stepCompleted: 'terminé',
    stepNumber: 'Étape',
    removeItem: 'Supprimer',
    addItem: 'Ajouter',
    calendar: 'Calendrier',
  },

  // Date/Time
  datetime: {
    months: {
      january: 'Janvier',
      february: 'Février',
      march: 'Mars',
      april: 'Avril',
      may: 'Mai',
      june: 'Juin',
      july: 'Juillet',
      august: 'Août',
      september: 'Septembre',
      october: 'Octobre',
      november: 'Novembre',
      december: 'Décembre',
    },
    monthsShort: {
      jan: 'Jan',
      feb: 'Fév',
      mar: 'Mar',
      apr: 'Avr',
      may: 'Mai',
      jun: 'Juin',
      jul: 'Juil',
      aug: 'Aoû',
      sep: 'Sep',
      oct: 'Oct',
      nov: 'Nov',
      dec: 'Déc',
    },
    days: {
      sunday: 'Dimanche',
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
    },
    daysShort: {
      sun: 'Dim',
      mon: 'Lun',
      tue: 'Mar',
      wed: 'Mer',
      thu: 'Jeu',
      fri: 'Ven',
      sat: 'Sam',
    },
    am: 'AM',
    pm: 'PM',
    today: "Aujourd'hui",
    selectDate: 'Sélectionner une date',
    selectTime: "Sélectionner l'heure",
    hour: 'Heure',
    minute: 'Minute',
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    dateLabel: 'Date',
    timeLabel: 'Heure',
  },

  // File upload
  file: {
    dragDrop: 'Glissez-déposez un fichier ici, ou',
    browse: 'parcourir',
    remove: 'Supprimer',
    maxSize: 'Taille max :',
    invalidType: "n'est pas un type de fichier accepté",
    exceedsMaxSize: 'dépasse la taille maximale de',
    selected: 'Sélectionné :',
    accepted: 'Acceptés :',
  },

  // Phone field
  phone: {
    searchCountry: 'Rechercher un pays...',
    selectCountry: 'Sélectionner un pays',
  },

  // Rating field
  rating: {
    stars: 'étoiles',
    outOf: 'sur',
    noRating: 'Aucune note',
  },

  // Tags field
  tags: {
    addTag: 'Ajouter un tag',
    removeTag: 'Supprimer le tag',
    maxTags: 'Nombre maximum de tags atteint',
  },

  // Array field
  array: {
    empty: 'Aucun élément. Ajoutez le premier !',
    row: 'Élément',
    rowAdded: 'Élément ajouté',
    rowRemoved: 'Élément supprimé',
    moveUp: 'Déplacer vers le haut la ligne',
    moveDown: 'Déplacer vers le bas la ligne',
    rowMovedUp: 'Élément déplacé vers le haut',
    rowMovedDown: 'Élément déplacé vers le bas',
    expand: 'Développer la ligne',
    collapse: 'Réduire la ligne',
    confirmRemove: 'Supprimer ?',
    minHint: 'Au moins {min} requis',
    maxHint: 'Maximum {max} autorisés',
    minMaxHint: 'Entre {min} et {max} éléments',
  },
};
export default fr;
