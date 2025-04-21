const backgroundImageSrc = (theme) => {
    if (theme === "blue") return "/themes/card_bg_blue.png"
    if (theme === "darkblue") return "/themes/card_bg_darkblue.png"
    if (theme === "green") return "/themes/card_bg_green.png"
    if (theme === "purple") return "/themes/card_bg_purple.png"
    if (theme === "brown") return "/themes/card_bg_brown.png"
    if (theme === "red") return "/themes/card_bg_red.png"
    if (theme === "orange") return "/themes/card_bg_orange.png"
    if (theme === "yellow") return "/themes/card_bg_yellow.png"
}

const bannerImageSrc = (theme) => {
    if (theme === "blue") return "/themes/banner_blue.png"
    if (theme === "darkblue") return "/themes/banner_darkblue.png"
    if (theme === "green") return "/themes/banner_green.png"
    if (theme === "purple") return "/themes/banner_purple.png"
    if (theme === "brown") return "/themes/banner_brown.png"
    if (theme === "red") return "/themes/banner_red.png"
    if (theme === "orange") return "/themes/banner_orange.png"
    if (theme === "yellow") return "/themes/banner_yellow.png"
}

const primary = (theme) => {
    if (theme === "darkblue") return "primaryDarkblue"
    if (theme === "green") return "primaryGreen"
    if (theme === "purple") return "primaryPurple"
    if (theme === "brown") return "primaryBrown"
    if (theme === "red") return "primaryRed"
    if (theme === "orange") return "primaryOrange"
    if (theme === "yellow") return "primaryYellow"
    return "primaryBlue"
}

const secondary = (theme) => {
    if (theme === "darkblue") return "secondaryDarkblue"
    if (theme === "green") return "secondaryGreen"
    if (theme === "purple") return "secondaryPurple"
    if (theme === "brown") return "secondaryBrown"
    if (theme === "red") return "secondaryRed"
    if (theme === "orange") return "secondaryOrange"
    if (theme === "yellow") return "secondaryYellow"
    return "secondaryBlue"
}

const tertiary = (theme) => {
    if (theme === "darkblue") return "tertiaryDarkblue"
    if (theme === "green") return "tertiaryGreen"
    if (theme === "purple") return "tertiaryPurple"
    if (theme === "brown") return "tertiaryBrown"
    if (theme === "red") return "tertiaryRed"
    if (theme === "orange") return "tertiaryOrange"
    if (theme === "yellow") return "tertiaryYellow"
    return "tertiaryBlue"
}

const accent = (theme) => {
    if (theme === "darkblue") return "accentDarkblue"
    if (theme === "green") return "accentGreen"
    if (theme === "purple") return "accentPurple"
    if (theme === "brown") return "accentBrown"
    if (theme === "red") return "accentRed"
    if (theme === "orange") return "accentOrange"
    if (theme === "yellow") return "accentYellow"
    return "accentBlue"
}

const accentForeground = (theme) => {
    if (theme === "darkblue") return "accentForegroundDarkblue"
    if (theme === "green") return "accentForegroundGreen"
    if (theme === "purple") return "accentForegroundPurple"
    if (theme === "brown") return "accentForegroundBrown"
    if (theme === "red") return "accentForegroundRed"
    if (theme === "orange") return "accentForegroundOrange"
    if (theme === "yellow") return "accentForegroundYellow"
    return "accentForegroundBlue"
}

const pointablePrimary = (theme) => {
    if (theme === "darkblue") return "pointablePrimaryDarkblue"
    if (theme === "green") return "pointablePrimaryGreen"
    if (theme === "purple") return "pointablePrimaryPurple"
    if (theme === "brown") return "pointablePrimaryBrown"
    if (theme === "red") return "pointablePrimaryRed"
    if (theme === "orange") return "pointablePrimaryOrange"
    if (theme === "yellow") return "pointablePrimaryYellow"
    return "pointablePrimaryBlue"
}

const pointableSecondary = (theme) => {
    if (theme === "darkblue") return "pointableSecondaryDarkblue"
    if (theme === "green") return "pointableSecondaryGreen"
    if (theme === "purple") return "pointableSecondaryPurple"
    if (theme === "brown") return "pointableSecondaryBrown"
    if (theme === "red") return "pointableSecondaryRed"
    if (theme === "orange") return "pointableSecondaryOrange"
    if (theme === "yellow") return "pointableSecondaryYellow"
    return "pointableSecondaryBlue"
}

const accentFormLabel = (theme) => {
    if (theme === "darkblue") return "formLabelAccentDarkblue"
    if (theme === "green") return "formLabelAccentGreen"
    if (theme === "purple") return "formLabelAccentPurple"
    if (theme === "brown") return "formLabelAccentBrown"
    if (theme === "red") return "formLabelAccentRed"
    if (theme === "orange") return "formLabelAccentOrange"
    if (theme === "yellow") return "formLabelAccentYellow"
    return "formLabelAccentBlue"
}

const borderPrimary = (theme) => {
    if (theme === "darkblue") return "primaryBorderDarkblue"
    if (theme === "green") return "primaryBorderGreen"
    if (theme === "purple") return "primaryBorderPurple"
    if (theme === "brown") return "primaryBorderBrown"
    if (theme === "red") return "primaryBorderRed"
    if (theme === "orange") return "primaryBorderOrange"
    if (theme === "yellow") return "primaryBorderYellow"
    return "primaryBorderBlue"
}

export { backgroundImageSrc };
export { bannerImageSrc };
export { primary };
export { secondary };
export { tertiary };
export { accent };
export { accentForeground };
export { pointablePrimary };
export { pointableSecondary };
export { accentFormLabel };
export { borderPrimary };