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
		.ͼc {
			color: yellow !important;
		}
		.ͼd {
			color: lightblue !important;
		}
		.ͼe {
			color: #f37272 !important;
		}
		`
		this.element.appendChild(styles)

		this.editor = new EditorView({
			doc: JSON.stringify(config.value.rawValue, null, 2),
			extensions: [
				basicSetup,
				javascript(),
				EditorView.updateListener.of((update) => {
					const value = update.state.doc.toString()
					try {
						this.value_.rawValue = JSON.parse(value)
						this.editor.contentDOM.style.border = 'none'
					} catch (e) {
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
		})
	}

	private refresh_(): void {}

	private onValueChange_() {
		this.refresh_();
	}
}
