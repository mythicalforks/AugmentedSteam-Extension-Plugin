import json
import os
import shutil

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
    def copy_frontend_files(self):
        envFolder = 'dev.chrome' if DEBUG else 'prod.chrome'
        augmentedSteamPath = os.path.join(GetPluginDir(), 'AugmentedSteam', 'dist', envFolder)
        steamUIPath = os.path.join(Millennium.steam_path(), 'steamui', 'AugmentedSteam')

        logger.log(f"Copying frontend files from {augmentedSteamPath} to {steamUIPath}")
        try:
            os.makedirs(os.path.dirname(steamUIPath), exist_ok=True)
            # Copy img folder to steamui
            for folderName in ['img']:
                folderPath = os.path.join(augmentedSteamPath, folderName)
                if os.path.exists(folderPath):
                    destPath = os.path.join(steamUIPath, folderName)
                    logger.log(f"Copying folder {folderName} from {folderPath} to {destPath}")
                    shutil.copytree(folderPath, destPath, dirs_exist_ok=True)
                else:
                    logger.error(f"Folder {folderName} does not exist in {folderPath}")

        except Exception as e:
            logger.error(f"Failed to copy files, {e}")

    def _front_end_loaded(self):
        return

    def _load(self):
        logger.log(f"bootstrapping AugmentedSteam plugin, millennium {Millennium.version()}")
        self.copy_frontend_files()

        Millennium.ready()  # this is required to tell Millennium that the backend is ready.

    def _unload(self):
        logger.log("unloading")
