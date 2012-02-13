# -*- coding: utf-8 -*-
try:
    import json
except ImportError:
    import simplejson as json

from urllib2 import urlopen
from urllib import urlencode

from OFS.SimpleItem import SimpleItem
from App.class_init import InitializeClass
from AccessControl.SecurityInfo import ClassSecurityInfo
from AccessControl.Permissions import view_management_screens, view
from Products.PageTemplates.PageTemplateFile import PageTemplateFile

manage_add_html = PageTemplateFile('zpt/manage_add', globals())
def manage_add_search(self, id, REQUEST=None):
    """ Create new AlleArterSearch object from ZMI.
    """
    ob = AlleArterSearch(id)
    self._setObject(id, ob)
    if REQUEST is not None:
        return self.manage_main(self, REQUEST, update_menu=1)
    return ob

from Products.NaayaCore.LayoutTool.DiskFile import allow_path
allow_path('Products.AlleArterSearch:www/css/')

QUERY_TERMS = ['Artsgruppe',
        'Rige',
        'Raekke',
        'Klasse',
        'Orden',
        'Familie',
        ]

FILTER_BY = ['Den_danske_rodliste',
        'Fredede_arter',
        'EF-habitatdirektivet',
        'EF-fuglebeskyttelsesdirektivet',
        'Bern-konventionen',
        'Bonn-konventionen',
        'Ovrige',
        ]

class AlleArterSearch(SimpleItem):
    """
        AlleArterSearch object
    """
    meta_type = 'Search AlleArter database'
    security = ClassSecurityInfo()

    items_per_page = 20

    manage_options = (
        SimpleItem.manage_options
        +
        (
            {'label' : 'Properties', 'action' :'manage_edit_html'},
        )
    )

    def __init__(self, id):
        """
            Constructor that builds new AlleArterSearch object.
        """
        self.id = id
        self.solr_connection = 'http://localhost:8983/solr'

    _index_html = PageTemplateFile('zpt/index', globals())
    security.declareProtected(view, 'index_html')
    def index_html(self, REQUEST=None):
        """ """

        if not self.get_solr_status():
            self.setSessionErrorsTrans('Database error (Solr does not respond)!')

        records, records_found = self.search(rows = self.items_per_page,
                                                      request = REQUEST)

        return self._index_html(REQUEST,
                                records = records,
                                fake_records = range(int(records_found)))

    security.declareProtected(view_management_screens, 'manage_edit_html')
    manage_edit_html = PageTemplateFile('zpt/manage_edit', globals())

    security.declareProtected(view_management_screens, 'manageProperties')
    def manageProperties(self, REQUEST=None, **kwargs):
        """ """
        if not self.checkPermissionEditObject():
            raise EXCEPTION_NOTAUTHORIZED, EXCEPTION_NOTAUTHORIZED_MSG

        if REQUEST is not None:
            params = dict(REQUEST.form)
        else:
            params = kwargs

        self.solr_connection = params.pop('solr_connection')
        self._p_changed = 1
        if REQUEST: REQUEST.RESPONSE.redirect('manage_edit_html?save=ok')

    security.declarePrivate('get_solr_status')
    def get_solr_status(self):
        """ """
        try:
            conn = urlopen('%s/dataimport?command=status&wt=json' % self.solr_connection)
            result = json.load(conn)
            return result['responseHeader']['status'] == 0
        except:
            return False

    security.declarePrivate('get_field_values')
    def get_field_values(self, query, entity_type, query_field=None, lang='en'):
        """ """
        if query_field is None:
            query_field = entity_type

        record = entity_type

        if lang == 'dk' and entity_type== 'Artsgruppe':
            query_field = '%s_dk' % query_field
            record = '%s_dk' % record

        query = {'q': '%s:%s' % (query_field, query.lower()),
                'fq': 'entity_type:%s' % entity_type,
                'sort': '%s asc' % record,
                'wt': 'json',
                'rows': 32000}

        url = u"%s/select/?%s" % (self.solr_connection, urlencode(query))
        conn = urlopen(url)
        result = json.load(conn)

        return [ r[record].encode('utf-8') for r in result['response']['docs'] ]

    security.declareProtected(view, 'jsonFieldValues')
    def jsonFieldValues(self, query, entity_type='Rige', query_field=None):
        """ """
        records = self.get_field_values(query, entity_type, query_field)
        return json.dumps(records)

    security.declareProtected(view, 'getFieldValues')
    def getFieldValues(self, entity_type, query_fields, request=None):
        """ """
        query = ''
        lang = request.form.get('lang', 'en')

        if query_fields:
            for query_field in query_fields:
                if request.form.get(query_field) != '*':
                    query = request.form.get(query_field)
                    break
            if not query:
                query = '*'
                query_field = query_fields[-1]
        else:
            query = '*'
            query_field = entity_type

        return self.get_field_values(query, entity_type, query_field, lang)

    def get_field(self, record, field, lang):
        """ """
        if lang == 'dk':
            field = '%s_dk' % field
        return record.get(field, None)

    security.declareProtected(view, 'search')
    def search(self, rows, request):
        """ """
        query_items = []

        filters = request.form.get('filters', 'yes')
        sort_on = request.get('sort', 'Videnskabeligt_navn asc')

        try:
            page = int(request.get('page', '1'))
        except ValueError:
            page = 1

        if filters == 'yes':

            lang = request.form.get('lang', 'en')

            for qt, qv in request.form.items():
                if qv and qt in QUERY_TERMS:
                    if lang == 'dk':
                        qt = '%s_dk' % qt
                    if qv == '*':
                        query_items.append("%s:*" % qt)
                    else:
                        query_items.append('%s:"%s"' % (qt, qv))
                if qt == 'Filter':
                    filter_items = []
                    for q in qv:
                        if q in FILTER_BY:
                            filter_items.append("%s:['' TO *]" % q)
                    filters = ' OR '.join(filter_items)
                    query_items.append('(%s)' % filters)

            if len(query_items) == 0:
                query_items.append('Artsgruppe:*')

            query = {'q': ' AND '.join(query_items),
                    'fq': 'entity_type:records',
                    'sort': sort_on,
                    'rows': rows,
                    'start':  (page-1)*self.items_per_page,
                    'wt': 'json'}

        elif filters == 'no':

            q = request.form.get('q', '')
            query = {'fq': 'entity_type:records',
                    'sort': sort_on,
                    'rows': rows,
                    'start':  (page-1)*self.items_per_page,
                    'wt': 'json'}
            if q:
                query['q'] = 'text:*%s*' % q
            else:
                query['q'] = '*'

        url = "%s/select/?%s" % (self.solr_connection, urlencode(query))
        conn = urlopen(url)
        result = json.load(conn)
        return result['response']['docs'], result['response']['numFound']

    def get_record_details(self, id):
        """ """
        url = "%s/select/?q=%s&wt=json" % (self.solr_connection, id)
        conn = urlopen(url)
        result = json.load(conn)
        return result['response']['docs'][0]

    def get_filters(self):
        """ """
        return FILTER_BY

    def get_url(self, request):
        """ """
        qs = []
        for k, v in request.form.items():
            if k not in ['sort', 'page', '-C']:
                qs.append('%s=%s' % (k,v))
        return '%s?%s' % (self.absolute_url(), '&'.join(qs))


    results_section = PageTemplateFile('zpt/results_section', globals())
    record_details = PageTemplateFile('zpt/record_details', globals())

    filters_box = PageTemplateFile('zpt/filters_box', globals())
    search_box = PageTemplateFile('zpt/search_box', globals())

InitializeClass(AlleArterSearch)