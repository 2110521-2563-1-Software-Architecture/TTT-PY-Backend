const responseSuccess = (res, statusCode, data = null, message = null) => {
  res.status(statusCode).json({
    status: "success",
    statusCode,
    data,
    message,
  });
};

const responseError = (res, statusCode, message) => {
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
};

module.exports = { responseSuccess, responseError };
