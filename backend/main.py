import json
import os

import Millennium
import PluginUtils  # type: ignore
import requests

logger = PluginUtils.Logger("augmented-steam")

CSS_ID = None
DEBUG = False

def GetPluginDir():
    return os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', '..'))

def BackendFetch(url: str) -> str:
    response = requests.get(url)

    result = {
        'status': response.status_code,
        'url': url,
        'headers': dict(response.headers),
        'body': response.text,
    }

    return json.dumps(result)

STEAM_ID = None

def GetSteamId():
    global STEAM_ID
    if STEAM_ID is None:
        STEAM_ID = Millennium.call_frontend_method('getSteamId')
    return STEAM_ID

RETRIEVE_URL_RESPONSE = None

def GetRetrieveUrlResponse():
    global RETRIEVE_URL_RESPONSE
    value = RETRIEVE_URL_RESPONSE
    RETRIEVE_URL_RESPONSE = None

    return value

def SetRetrieveUrlResponse(response: str):
    global RETRIEVE_URL_RESPONSE

    RETRIEVE_URL_RESPONSE = response

class Plugin:
    def _front_end_loaded(self):
        return

    def _load(self):
        logger.log(f"bootstrapping AugmentedSteam plugin, millennium {Millennium.version()}")
        Millennium.ready()  # this is required to tell Millennium that the backend is ready.

    def _unload(self):
        logger.log("unloading")
