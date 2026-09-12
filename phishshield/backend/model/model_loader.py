from transformers import pipeline

classifier = None

def load_model():
    global classifier

    if classifier is None:
        classifier = pipeline(
            "text-classification",
            model="kmack/malicious-url-detection"
        )

    return classifier