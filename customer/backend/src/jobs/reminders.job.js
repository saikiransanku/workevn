export function scheduleServiceReminders() {
  return {
    name: 'service-reminders',
    cadence: 'daily',
    description: 'Find due service reminders and enqueue customer notifications.',
  }
}
