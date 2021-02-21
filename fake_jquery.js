function $(search) {
	const id = search.substr(1);
	return search.charAt(0) === '#' ? document.getElementById(id) : document.getElementsByClassName(id);
}

$.ajax = async function(args) {
	const req = new Request(args.url);
	try {
		const res = await fetch(req);
		args.success(await res.text());
	} catch(e) {
		args.error(e);
	}
}

HTMLElement.prototype.show = function() {
	this.style.display = 'inline';
}

HTMLElement.prototype.hide = function() {
	this.style.display = 'none';
}

HTMLElement.prototype.removeClass = function(className) {
	this.classList.remove(className);
}

HTMLElement.prototype.addClass = function(className) {
	this.classList.add(className);
}

HTMLElement.prototype.hasClass = function(className) {
	return this.classList.contains(className);
}

HTMLElement.prototype.css = function(prop, val) {
	this.style[prop] = val;
}

HTMLElement.prototype.val = function(newVal) {
	if (typeof newVal !== 'undefined') {
		this.value = newVal;
	}
	return this.value;
}

HTMLElement.prototype.html = function(content) {
	return this.innerHTML = content;
}

HTMLElement.prototype.attr = function(prop, val) {
	return this[prop] = val;
}

HTMLCollection.prototype.show = function() {
	for (let i = 0; i < this.length; i++) {
		this[i].show();
	}
}

HTMLCollection.prototype.hide = function() {
	for (let i = 0; i < this.length; i++) {
		this[i].hide();
	}
}

HTMLCollection.prototype.removeClass = function(className) {
	for (let i = 0; i < this.length; i++) {
		this[i].classList.remove(className);
	}
}

HTMLCollection.prototype.addClass = function(className) {
	for (let i = 0; i < this.length; i++) {
		this[i].classList.add(className);
	}
}

HTMLCollection.prototype.css = function(prop, val) {
	for (let i = 0; i < this.length; i++) {
		this[i].style[prop] = val;
	}
}
