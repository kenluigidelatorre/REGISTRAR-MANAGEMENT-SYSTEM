function notFound(req, res) { res.status(404).json({ status: "error", message: "API endpoint not found." }); }
function errorHandler(error, req, res, next) {
  console.error(error);
  if (error.code === "23505") return res.status(409).json({ status: "error", message: "A record with that ID or unique value already exists." });
  if (error.code === "23503") return res.status(409).json({ status: "error", message: "This record is linked to another academic record and cannot be changed or deleted." });
  if (error.code === "23514" || error.code === "22P02") return res.status(400).json({ status: "error", message: "One or more supplied values are invalid." });
  res.status(500).json({ status: "error", message: "An unexpected server error occurred." });
}
module.exports = { notFound, errorHandler };
