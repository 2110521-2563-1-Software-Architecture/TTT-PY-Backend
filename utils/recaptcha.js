const config = require("../config/config");
const Bluebird = require("bluebird");
const Recaptcha = require("recaptcha-v2").Recaptcha;
/**
 * Verify ReCaptcha
 * @param {Object} recaptchaData
 * @returns {Promise}
 */
exports.verifyRecaptcha = (remoteip, recaptchaResponse) => {
  if (config.recaptchaSkipEnabled === "true") {
    // For development purpose only, you need to add SKIP_ENABLED in .env
    return Bluebird.resolve();
  }
  var recaptchaData = {
    remoteip,
    response: recaptchaResponse,
    secret: config.recaptchaSecretKey,
  };
  return new Bluebird((resolve, reject) => {
    const recaptcha = new Recaptcha(
      config.recaptchaSiteKey,
      config.recaptchaSecretKey,
      recaptchaData
    );
    recaptcha.verify((success) => {
      if (success) {
        return resolve();
      }
      reject(new Error());
    });
  });
};
