export const RALLY_THEME =
  'Is Climate Change Around the World Caused by Global Warming?'

export const RALLY_LOCATION = 'Rally at the National Mall, Washington, D.C.'

export type TermsSection = {
  title: string
  items: string[]
}

export const termsSections: TermsSection[] = [
  {
    title: '1. Eligibility and Residency',
    items: [
      'You must be 18 years of age or older to participate.',
      'Participation is limited to domestic residents within the United States.',
      'All virtual rallies and interactions are authorized for domestic use within the U.S. only.',
    ],
  },
  {
    title: '2. Rally Schedule (U.S. Eastern Time)',
    items: ['Check-in Opens: 10:00 AM', 'Rally Hours: 6:00 PM – 8:00 PM'],
  },
  {
    title: '3. Absolute Privacy & Non-Collection of Personal Data',
    items: [
      'We strictly do NOT collect, store, or track any personal information, including your IP address, email, or real identity.',
      'Your participation is fully anonymous.',
    ],
  },
  {
    title: '4. Data Erasure and Oblivion',
    items: [
      'Following the conclusion of the rally, all transactional and interactive data will be permanently and completely deleted.',
      'Only aggregated, non-identifiable statistical attributes (total counts) will be retained for historical awareness.',
    ],
  },
  {
    title: '5. Disclaimer of Liability',
    items: [
      'This platform is a simulation tool for sentiment visualization.',
      'The platform is not responsible for external user actions, network interruptions, or third-party interpretations of the aggregated data.',
      'We do not guarantee continuous, uninterrupted access to the platform.',
    ],
  },
]

export const termsPreamble =
  'Welcome to Will of America. By clicking "Agree to Terms & Attend," you agree to comply with and be bound by the following terms.'
