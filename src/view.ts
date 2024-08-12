import {ClassName, Value, View, ViewProps} from '@tweakpane/core';
import {basicSetup, EditorView} from 'codemirror';
import {javascript} from '@codemirror/lang-javascript';

interface Config {
	value: Value<object>;
	viewProps: ViewProps;
}

// Create a class name generator from the view name
// ClassName('json-editor') will generate a CSS class name like `tp-json-editorv`
const className = ClassName('json-editor');

// Custom view class should implement `View` interface
export class PluginView implements View {
	public readonly element: HTMLElement;
	private value_: Value<object>
	private editor: EditorView
	private editorInited: boolean = false

	constructor(doc: Document, config: Config) {
		// Create a root element for the plugin
		this.element = doc.createElement('div');
		this.element.classList.add(className());
		// Bind view props to the element
		config.viewProps.bindClassModifiers(this.element);

		// Receive the bound value from the controller
		this.value_ = config.value;
		// Handle 'change' event of the value
		this.value_.emitter.on('change', this.onValueChange_.bind(this));

		const styles = doc.createElement('style')
		styles.innerHTML = `.cm-gutters {
			display: none !important;
		}
		.cm-scroller {
			background: #28292E;
		}
		.cm-activeLine {
			background: #37383D !important;
		}
		.cm-line {
			color: #BBBCC4 !important;
		}
		.cm-line > * {
			color: #BBBCC4 !important;
		}
		.ͼc {
			color: inherit;
		}
		.ͼd {
			color: #3293a8 !important;
		}
		.ͼe {
			color: #f37272 !important;
		}
		`
		this.element.appendChild(styles)

		this.editor = new EditorView({
			doc: this.stringifyRelaxedJson_(config.value.rawValue),
			extensions: [
				basicSetup,
				javascript(),
				EditorView.updateListener.of((update) => {
					if(!this.editorInited || !update.docChanged) {
						return;
					}

					const value = update.state.doc.toString()
					try {
						this.value_.rawValue = this.parseRelaxedJson_(value)
						this.editor.contentDOM.style.border = 'none'
					} catch (e) {
						console.error(e)
						this.editor.contentDOM.style.border = '2px solid red'
					}
				})
			],
			parent: this.element,
		});

		// Apply the initial value
		this.refresh_();

		config.viewProps.handleDispose(() => {
			// Called when the view is disposing
			console.log('TODO: dispose view');
		});

		setTimeout(() => {
			const parent = this.element.parentElement
			if (parent && parent.parentElement) {
				parent.parentElement.style.flexDirection = 'column'
				parent.parentElement.style.alignItems = 'flex-start'
				parent.style.width = '100%'
				this.element.style.height = 'max-content'
			}
			this.editorInited = true
		})
	}

	private refresh_(): void {}

	private onValueChange_() {
		this.refresh_();
	}

	private stringifyRelaxedJson_(value: any): string {
		const cleaned = JSON.stringify(value, null, 2);

		return cleaned.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, function (match) {
			return match.replace(/"/g, "");
		});
	}

	private parseRelaxedJson_(value: string): any {
		return JSON.parse(
			value.replace(/:\s*"([^"]*)"/g, function(match, p1) {
				return ': "' + p1.replace(/:/g, '@colon@') + '"';
			})
			// Replace ":" with "@colon@" if it's between single-quotes
			.replace(/:\s*'([^']*)'/g, function(match, p1) {
				return ': "' + p1.replace(/:/g, '@colon@') + '"';
			})

			// Add double-quotes around any tokens before the remaining ":"
			.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g, '"$2": ')

			// Turn "@colon@" back into ":"
			.replace(/@colon@/g, ':')
		)
	}
}
