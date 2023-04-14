from . import listing
import time

def run():
    listing_obj = listing.Listing()
    listing_obj.divar_bot()
    
    # with listing.DivarBot() as divar_bot:
    #     divar_bot.scanner()