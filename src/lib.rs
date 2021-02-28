mod utils;

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use utils::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn print_canvas(canvas: &web_sys::HtmlCanvasElement) {
    set_panic_hook();
    let width = canvas.width();
    let height = canvas.height();
    let context = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<web_sys::CanvasRenderingContext2d>()
        .unwrap();
    let image_data: wasm_bindgen::Clamped<Vec<u8>> = context
        .get_image_data(0.0, 0.0, width as f64, height as f64)
        .unwrap()
        .data();
    for i in 0..height {
        for j in 0..width {
            let offset = (i * height + j) * 4;
            log!("({}, {}): rgba({}, {}, {}, {})",
                i, j,
                image_data[offset as usize],
                image_data[offset as usize + 1],
                image_data[offset as usize + 2],
                image_data[offset as usize + 3],
            )
        }
    }
}
