from .listing import listing
import time

def run():
    listing_obj = listing.Listing()
    divar = listing_obj.DivarBot()
    divar.run()
    