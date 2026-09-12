from .model_loader import load_model


def predict_url(url: str):
    model = load_model()

    result = model(url)[0]

    return {
        "label": result["label"],
        "confidence": round(result["score"] * 100, 2)
    }