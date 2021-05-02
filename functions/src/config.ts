export default {
  inactiveDays: (process.env.INACTIVE_AFTER_DAYS === undefined) ? 30 : +process.env.INACTIVE_AFTER_DAYS,
}
