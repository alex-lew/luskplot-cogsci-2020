module Luskplot

using PyCall

const transformers = PyNULL()
const torch = PyNULL()
const gpt2tokenizer = PyNULL()
const gpt2model = PyNULL()
const xltokenizer = PyNULL()
const xlmodel = PyNULL()
const XL_VOCAB_SIZE = 32000
const xlvocab = String[]

function __init__()
    copy!(transformers, pyimport_conda("transformers", "transformers"))
    copy!(torch, pyimport_conda("torch", "pytorch"))

    torch.set_grad_enabled(false)

    # GPT-2
    copy!(gpt2tokenizer, transformers.GPT2Tokenizer.from_pretrained("gpt2"))
    copy!(gpt2model, transformers.GPT2LMHeadModel.from_pretrained("gpt2"))

    # XLNet
    copy!(xltokenizer, transformers.XLNetTokenizer.from_pretrained("xlnet-large-cased"))
    copy!(xlmodel, transformers.XLNetLMHeadModel.from_pretrained("xlnet-large-cased"))
    copy!(xlvocab, String[xltokenizer.decode(i-1) for i=1:XL_VOCAB_SIZE])
end

include("elaborate.jl")
include("fill_blank.jl")
# include("associated_quantity.jl")

end # module
