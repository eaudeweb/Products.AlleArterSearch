import AlleArterSearch
from App.ImageFile import ImageFile

def initialize(context):
    """
        Product initialization method
        @param context: Zope server context
    """
    context.registerClass(
        AlleArterSearch.AlleArterSearch,
        constructors = (
            AlleArterSearch.manage_add_html,
            AlleArterSearch.manage_add_search),
        icon = 'www/meta_type.png'
    )

misc_ = {
    'allearter_style.css':ImageFile('www/css/allearter_style.css', globals()),
    'allearter.js':ImageFile('www/js/allearter.js', globals()),
    'arrows.gif':ImageFile('www/arrows.gif', globals()),
    's.gif':ImageFile('www/s.gif', globals())
}