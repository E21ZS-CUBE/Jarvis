import pyttsx3
import pywhatkit


#engine
engine = pyttsx3.init()
voice = engine.getProperty("voices")


def speak(sentence):
    engine.say(sentence)
    engine.runAndWait

speak("Hello Sir")

#Functions
def Youtube_Play(Search):
    pywhatkit.playonyt(Search)


def WhatsappMsg()