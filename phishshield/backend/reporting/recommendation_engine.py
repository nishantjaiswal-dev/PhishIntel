def generate_recommendations(
        risk_score
):

    recommendations = []

    if risk_score > 80:

        recommendations.extend([
            "Do not enter passwords",
            "Do not download files",
            "Avoid visiting this website",
            "Report this URL if received via email or SMS"
        ])

    elif risk_score > 60:

        recommendations.extend([
            "Proceed with caution",
            "Verify domain ownership",
            "Avoid sensitive transactions"
        ])

    elif risk_score > 40:

        recommendations.extend([
            "Inspect the URL carefully",
            "Verify website legitimacy"
        ])

    else:

        recommendations.extend([
            "No major threats detected"
        ])

    return recommendations