# [Probability Tree](http://narsil.github.com)

by [Narsil][].

[Narsil]: http://github.com/Narsil

Please note that this is a beta version, so bugs and unimplemented features
are all over the place.

## Requirements

* [jQuery 1.4.3+](http://jquery.com).
* [MathQuill](http://mathquill.github.com).
* [Raphael](http://raphaeljs.com).


## Screenshots

![Display](https://raw.github.com/Narsil/probability_tree/master/img/display.png "Display")
![Edit](https://raw.github.com/Narsil/probability_tree/master/img/editable.png "Editable")


## Usage

To use you will need to provide

The stylesheet

    <link rel="stylesheet" type="text/css" href="/path/to/probability_tree.css">`

the script

    <script src="/path/to/probability_tree.js"></script>

Then wherever you'd like a probability tree:

    <span class="probability-tree">{'E1': 0.5, 'E2': 0.5}</span>

or have an editable probability tree:

    <span class="probability-tree editable">{'E1': 0.5, 'E2': 0.5}</span>

For dynamically created elements:

`$(yourdiv).probability_tree({data: {'E1': 0.5, 'E2': 0.5})` or `.probability_tree({tree_editable:true})`


You can get the data of a tree dynamically (if editable) via 


    $(yourdiv).probability_tree('data')


###Data you need to provide

The data you need to provide is a JSON in form of a tree. Keys are the name of the
events in the probability. The object behind the key contains either 'value' which
is the probability to attain current event. 'intersection' is valid for leaf nodes
and corresponds to the intersection of probabilities of all the events that happened.

All other keys must correspond to subsequent events and have the same structure.

When adding via HTML you directly dump the JSON in your div., When adding 
dynamically it has to be in the following form `$(yourdiv).probability_tree({data: json})`.

You can be more fine grained for editability when doing adding dynamically:

* probability_editable:  Ability to edit probabilities within the tree
* tree_editable:  Ability to edit the tree structure
* event_editable: Ability to edit event names
* intersection_editable: Ability to edit probabilities at the end of the tree


All values (probabilities, event names) can be LaTeX as they are going to be mathquilled.

## Testing

You can test by getting the code running your own webserver (eg: `python -m SimpleHTTPServer`)
And opening `index.html` in your browser.

All dependencies are included in that file.

## Open-Source License

[GNU Lesser General Public License](http://www.gnu.org/licenses/lgpl.html)

Copyleft 2013 [Narsil][]
