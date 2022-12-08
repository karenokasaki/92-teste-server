function isAdmin(req, res, next) {
  try {
    if (req.currentUser.role !== "ADMIN") {
      return res.status(401).json({ msg: "User sem autorização" });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

export default isAdmin;
