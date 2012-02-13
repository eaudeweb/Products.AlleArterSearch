from setuptools import setup, find_packages

setup(name='Products.AlleArterSearch',
    version='0.0.1',
    author='Cornel Nitu, Eau de Web',
    author_email='office@eaudeweb.ro',
    url='http://eaudeweb.ro',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'simplejson',
    ]
)
