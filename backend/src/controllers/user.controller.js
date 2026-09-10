

export const getMe = async (req, res) => {
    res.status(200).json({
        message: "User fetched successfully",
        user: {
            id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email
        }
    })
}